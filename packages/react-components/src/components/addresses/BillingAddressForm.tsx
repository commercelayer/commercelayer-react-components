import { type JSX, type ReactNode, useContext } from "react"
import AddressesContext from "#context/AddressContext"
import BillingAddressFormContext from "#context/BillingAddressFormContext"
import CommerceLayerContext from "#context/CommerceLayerContext"
import OrderContext from "#context/OrderContext"
import type { CustomFieldMessageError } from "#reducers/AddressReducer"
import { useAddressFormFields } from "#hooks/useAddressFormFields"
import { useStandaloneAddress } from "#hooks/useStandaloneAddress"
import { getSaveBillingAddressToAddressBook } from "#utils/localStorage"

type Props = {
  children: ReactNode
  reset?: boolean
  errorClassName?: string
  fieldEvent?: "blur" | "change"
  customFieldMessageError?: CustomFieldMessageError
  /**
   * Whether the address is a business address.
   * Used in standalone mode (without `<AddressesContainer>`).
   */
  isBusiness?: boolean
  /**
   * Whether the shipping address differs from the billing address.
   * Used in standalone mode (without `<AddressesContainer>`).
   */
  shipToDifferentAddress?: boolean
} & Omit<JSX.IntrinsicElements["form"], "onSubmit">

export function BillingAddressForm(props: Props): JSX.Element {
  const {
    children,
    errorClassName,
    autoComplete = "on",
    reset = false,
    customFieldMessageError,
    isBusiness: isBusiness_prop = false,
    shipToDifferentAddress: shipToDifferentAddress_prop = false,
    ...p
  } = props

  const parentAddressContext = useContext(AddressesContext)
  const isStandalone = parentAddressContext.saveAddresses == null

  const isBusiness = isStandalone ? isBusiness_prop : (parentAddressContext.isBusiness ?? false)
  const shipToDifferentAddress = isStandalone
    ? shipToDifferentAddress_prop
    : (parentAddressContext.shipToDifferentAddress ?? shipToDifferentAddress_prop)

  const config = useContext(CommerceLayerContext)
  const { saveAddressToCustomerAddressBook, order, orderId, include, addResourceToInclude, includeLoaded, updateOrder } =
    useContext(OrderContext)

  const standalone = useStandaloneAddress({
    isStandalone,
    config,
    order,
    orderId,
    updateOrder,
    isBusiness,
    shipToDifferentAddress,
  })

  const setAddress = isStandalone ? standalone.standaloneSetAddress : parentAddressContext.setAddress
  const setAddressErrors = isStandalone ? standalone.standaloneSetAddressErrors : parentAddressContext.setAddressErrors

  const { formValues, errors, setFormRef, setValue, resetField } = useAddressFormFields({
    resource: "billing_address",
    isBusiness,
    shouldSync: true,
    customFieldMessageError,
    reset,
    saveAddressToCustomerAddressBook,
    getSaveToAddressBook: getSaveBillingAddressToAddressBook,
    setAddress,
    setAddressErrors,
    include,
    addResourceToInclude,
    includeLoaded,
  })

  const providerValues = {
    isBusiness,
    values: formValues,
    setValue,
    errorClassName,
    requiresBillingInfo: order?.requires_billing_info ?? false,
    errors,
    resetField,
  }

  const formContent = (
    <BillingAddressFormContext.Provider value={providerValues}>
      <form ref={setFormRef} autoComplete={autoComplete} {...p}>
        {children}
      </form>
    </BillingAddressFormContext.Provider>
  )

  if (isStandalone) {
    return (
      <AddressesContext.Provider value={standalone.standaloneContextValue}>
        {formContent}
      </AddressesContext.Provider>
    )
  }

  return formContent
}

export default BillingAddressForm
