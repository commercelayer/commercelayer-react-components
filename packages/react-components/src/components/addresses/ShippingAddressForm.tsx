import { type JSX, type ReactNode, useContext } from "react"
import AddressesContext from "#context/AddressContext"
import type { DefaultContextAddress, ErrorMode } from "#context/BillingAddressFormContext"
import CommerceLayerContext from "#context/CommerceLayerContext"
import OrderContext from "#context/OrderContext"
import ShippingAddressFormContext from "#context/ShippingAddressFormContext"
import { useAddressFormFields } from "#hooks/useAddressFormFields"
import { useStandaloneAddress } from "#hooks/useStandaloneAddress"
import type { CustomFieldMessageError } from "#reducers/AddressReducer"
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
  /**
   * Controls when validation errors are displayed.
   * - `"inline"` (default): errors appear as the user types each field.
   * - `"submit"`: errors appear only after the user clicks Save (via `SaveAddressesButton`).
   *   After the first Save attempt, errors update live as the user corrects them.
   */
  errorMode?: ErrorMode
}

export function ShippingAddressForm(props: Props): JSX.Element {
  const {
    children,
    errorClassName,
    autoComplete = "on",
    fieldEvent: _fieldEvent = "change",
    reset = false,
    customFieldMessageError,
    errorMode = "inline",
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
  const {
    saveAddressToCustomerAddressBook,
    include,
    addResourceToInclude,
    includeLoaded,
    order,
    orderId,
    updateOrder,
  } = useContext(OrderContext)

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

  const setAddress = isStandalone
    ? standalone.standaloneSetAddress
    : parentAddressContext.setAddress
  const setAddressErrors = isStandalone
    ? standalone.standaloneSetAddressErrors
    : parentAddressContext.setAddressErrors

  const { formValues, errors, setFormRef, setValue, resetField, validate } = useAddressFormFields({
    resource: "shipping_address",
    isBusiness,
    shouldSync,
    customFieldMessageError,
    reset,
    errorMode,
    saveAddressToCustomerAddressBook,
    getSaveToAddressBook: getSaveShippingAddressToAddressBook,
    setAddress,
    setAddressErrors,
    include,
    addResourceToInclude,
    includeLoaded,
  })

  const reducerAddressValues = isStandalone
    ? (standalone.standaloneState.shipping_address as Record<string, unknown> | undefined)
    : (parentAddressContext.shipping_address as Record<string, unknown> | undefined)
  const prefixedReducerValues = Object.fromEntries(
    Object.entries(reducerAddressValues ?? {})
      .filter(([, v]) => v != null && v !== "")
      .map(([k, v]) => [`shipping_address_${k}`, String(v)])
  )

  const providerValues: DefaultContextAddress = {
    values: { ...prefixedReducerValues, ...formValues } as typeof formValues,
    setValue,
    errorClassName,
    errors,
    resetField,
    errorMode,
    validate,
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
