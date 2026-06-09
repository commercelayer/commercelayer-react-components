import { type JSX, type ReactNode, useContext } from "react"
import AddressesContext from "#context/AddressContext"
import BillingAddressFormContext from "#context/BillingAddressFormContext"
import type { ErrorMode } from "#context/BillingAddressFormContext"
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
  /**
   * Controls when validation errors are displayed.
   * - `"inline"` (default): errors appear as the user types each field.
   * - `"submit"`: errors appear only after the user clicks Save (via `SaveAddressesButton`).
   *   After the first Save attempt, errors update live as the user corrects them.
   */
  errorMode?: ErrorMode
} & Omit<JSX.IntrinsicElements["form"], "onSubmit">

export function BillingAddressForm(props: Props): JSX.Element {
  const {
    children,
    errorClassName,
    autoComplete = "on",
    reset = false,
    customFieldMessageError,
    errorMode = "inline",
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
  const {
    saveAddressToCustomerAddressBook,
    order,
    orderId,
    include,
    addResourceToInclude,
    includeLoaded,
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
  })

  const setAddress = isStandalone
    ? standalone.standaloneSetAddress
    : parentAddressContext.setAddress
  const setAddressErrors = isStandalone
    ? standalone.standaloneSetAddressErrors
    : parentAddressContext.setAddressErrors

  const { formValues, errors, setFormRef, setValue, resetField, validate } = useAddressFormFields({
    resource: "billing_address",
    isBusiness,
    shouldSync: true,
    customFieldMessageError,
    reset,
    errorMode,
    saveAddressToCustomerAddressBook,
    getSaveToAddressBook: getSaveBillingAddressToAddressBook,
    setAddress,
    setAddressErrors,
    include,
    addResourceToInclude,
    includeLoaded,
  })

  // Read the address reducer values so that fields set via setValue (which always
  // calls setAddress regardless of the 'required' attribute) are exposed in the
  // form context. This is required by AddressStateSelector, which watches
  // billingAddress.values["billing_address_country_code"] to detect the country.
  // rapid-form only tracks required fields; the reducer captures everything.
  const reducerAddressValues = isStandalone
    ? (standalone.standaloneState["billing_address"] as Record<string, unknown> | undefined)
    : (parentAddressContext["billing_address"] as Record<string, unknown> | undefined)
  const prefixedReducerValues = Object.fromEntries(
    Object.entries(reducerAddressValues ?? {})
      .filter(([, v]) => v != null && v !== "")
      .map(([k, v]) => [`billing_address_${k}`, String(v)])
  )

  const providerValues = {
    isBusiness,
    // Merge: rapid-form values (objects) take precedence over reducer values (strings).
    // AddressStateSelector handles both via: typeof v === "string" ? v : v?.value
    values: { ...prefixedReducerValues, ...formValues } as typeof formValues,
    setValue,
    errorClassName,
    requiresBillingInfo: order?.requires_billing_info ?? false,
    errors,
    resetField,
    errorMode,
    validate,
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
