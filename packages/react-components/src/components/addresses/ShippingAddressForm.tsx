import { type JSX, type ReactNode, useContext } from "react"
import AddressesContext from "#context/AddressContext"
import type { DefaultContextAddress } from "#context/BillingAddressFormContext"
import CommerceLayerContext from "#context/CommerceLayerContext"
import OrderContext from "#context/OrderContext"
import ShippingAddressFormContext from "#context/ShippingAddressFormContext"
import type { CustomFieldMessageError } from "#reducers/AddressReducer"
import { useAddressFormFields } from "#hooks/useAddressFormFields"
import { useStandaloneAddress } from "#hooks/useStandaloneAddress"
import { getSaveShippingAddressToAddressBook } from "#utils/localStorage"

interface Props extends Omit<JSX.IntrinsicElements["form"], "onSubmit"> {
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
   * In standalone mode defaults to `true` (this is a shipping form).
   * Used in standalone mode (without `<AddressesContainer>`).
   */
  shipToDifferentAddress?: boolean
}

export function ShippingAddressForm(props: Props): JSX.Element {
  const {
    children,
    errorClassName,
    autoComplete = "on",
    fieldEvent: _fieldEvent = "change",
    reset = false,
    customFieldMessageError,
    isBusiness: isBusiness_prop = false,
    shipToDifferentAddress: shipToDifferentAddress_prop = true,
    ...p
  } = props

  const parentAddressContext = useContext(AddressesContext)
  const isStandalone = parentAddressContext.saveAddresses == null

  const isBusiness = isStandalone ? isBusiness_prop : (parentAddressContext.isBusiness ?? false)
  const shipToDifferentAddress = isStandalone
    ? shipToDifferentAddress_prop
    : (parentAddressContext.shipToDifferentAddress ?? shipToDifferentAddress_prop)
  const invertAddresses = isStandalone ? false : (parentAddressContext.invertAddresses ?? false)
  const shouldSync = shipToDifferentAddress || invertAddresses

  const config = useContext(CommerceLayerContext)
  const { saveAddressToCustomerAddressBook, include, addResourceToInclude, includeLoaded, order, orderId, updateOrder } =
    useContext(OrderContext)

  const standalone = useStandaloneAddress({
    isStandalone,
    config,
    order,
    orderId,
    updateOrder,
    isBusiness,
    shipToDifferentAddress,
    invertAddresses,
  })

  const setAddress = isStandalone ? standalone.standaloneSetAddress : parentAddressContext.setAddress
  const setAddressErrors = isStandalone ? standalone.standaloneSetAddressErrors : parentAddressContext.setAddressErrors

  const { formValues, errors, setFormRef, setValue, resetField } = useAddressFormFields({
    resource: "shipping_address",
    isBusiness,
    shouldSync,
    customFieldMessageError,
    reset,
    saveAddressToCustomerAddressBook,
    getSaveToAddressBook: getSaveShippingAddressToAddressBook,
    setAddress,
    setAddressErrors,
    include,
    addResourceToInclude,
    includeLoaded,
  })

  const providerValues: DefaultContextAddress = {
    values: formValues,
    setValue,
    errorClassName,
    errors,
    resetField,
  }

  const formContent = (
    <ShippingAddressFormContext.Provider value={providerValues}>
      <form ref={setFormRef} autoComplete={autoComplete} {...p}>
        {children}
      </form>
    </ShippingAddressFormContext.Provider>
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

export default ShippingAddressForm
