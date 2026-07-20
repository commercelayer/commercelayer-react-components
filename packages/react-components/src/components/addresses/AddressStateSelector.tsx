import {
  type ComponentProps,
  type JSX,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react"
import BaseInput from "#components/utils/BaseInput"
import BaseSelect from "#components/utils/BaseSelect"
import BillingAddressFormContext from "#context/BillingAddressFormContext"
import CustomerAddressFormContext from "#context/CustomerAddressFormContext"
import ShippingAddressFormContext from "#context/ShippingAddressFormContext"
import type { AddressStateSelectName, BaseSelectComponentProps, Option } from "#typings"
import { getStateOfCountry, isValidState, type States } from "#utils/countryStateCity"
import { isEmpty } from "#utils/isEmpty"

const BILLING_COUNTRY_KEY = "billing_address_country_code" as const
const SHIPPING_COUNTRY_KEY = "shipping_address_country_code" as const

type Props = Omit<BaseSelectComponentProps, "options" | "name" | "placeholder"> & {
  name: AddressStateSelectName
  required?: boolean
  disabled?: boolean
  /**
   * Optional class name for the input field.
   */
  inputClassName?: string
  /**
   * Optional placeholder for the input field.
   */
  inputPlaceholder?: string
  /**
   * Optional class name for the select field.
   */
  selectClassName?: string
  /**
   * Optional placeholder for the select field.
   */
  selectPlaceholder?: Option
  /**
   * Optional states list to extend the default one.
   * This component will try to render a select getting as options the states found for the selected country.
   * If the country has no states, it will render a text input field instead.
   */
  states?: States
} & Pick<JSX.IntrinsicElements["select"], "className" | "id" | "style">

/**
 * The AddressInput component creates a form `select` related to the `state_code` attribute of the `address` object.
 *
 * It requires a `name` prop to define the field name associated with the select and accepts most of HTML `select` tag standard props.
 *
 * <span title="Name prop" type="info">
 * The `name` prop must respect the convention of mentioning one of the available addresses forms (`billing_address` or `shipping_address`) concatenated to the `state_code` address attribute with a `_` separator. Eg.: `billing_address_state_code`.
 * </span>
 *
 * <span title="Requirement" type="warning">
 * It must to be used inside either the `<BillingAddressForm>` or the `<ShippingAddressForm>` component.
 * </span>
 *
 * <span title="Fields" type="info">
 * Check the `addresses` resource from our [Core API documentation](https://docs.commercelayer.io/core/v/api-reference/addresses/object)
 * for more details about the available attributes to render.
 * </span>
 */
export function AddressStateSelector(props: Props): JSX.Element {
  const {
    required = false,
    value,
    name,
    className = "",
    inputClassName = "",
    inputPlaceholder,
    selectClassName = "",
    selectPlaceholder,
    states,
    ...p
  } = props
  const billingAddress = useContext(BillingAddressFormContext)
  const shippingAddress = useContext(ShippingAddressFormContext)
  const customerAddress = useContext(CustomerAddressFormContext)
  const [hasError, setHasError] = useState(false)
  const [countryCode, setCountryCode] = useState("")
  const [val, setVal] = useState(value ?? "")
  // Tracks the current DOM value of the text input so that externally pre-filled
  // values (via billingAddress.setValue called by AddressInput or similar) can be
  // picked up when transitioning from text input to state select.
  const textInputRef = useRef<HTMLInputElement | null>(null)

  const stateOptions = useMemo(() => {
    if (isEmpty(countryCode)) {
      return []
    }
    return getStateOfCountry({
      countryCode,
      states,
    })
  }, [states, countryCode])

  const isEmptyStates = useMemo(() => () => isEmpty(stateOptions), [stateOptions])

  // biome-ignore lint/correctness/useExhaustiveDependencies: intentionally tracking specific nested values for country change detection
  useEffect(() => {
    const billingCountryValue = billingAddress?.values?.[BILLING_COUNTRY_KEY]
    const billingCountryCode =
      typeof billingCountryValue === "string" ? billingCountryValue : billingCountryValue?.value
    if (billingCountryCode && billingCountryCode !== countryCode) setCountryCode(billingCountryCode)
    const shippingCountryValue = shippingAddress?.values?.[SHIPPING_COUNTRY_KEY]
    const shippingCountryCode =
      typeof shippingCountryValue === "string" ? shippingCountryValue : shippingCountryValue?.value
    if (shippingCountryCode && shippingCountryCode !== countryCode)
      setCountryCode(shippingCountryCode)
    // True when this is the first time a country is detected (was empty before).
    // Used to distinguish initial pre-fill from a user-initiated country change.
    const isFirstCountryDetection = !countryCode

    const changeBillingCountry = [
      Object.keys(billingAddress).length > 0,
      billingCountryCode,
      countryCode !== billingCountryCode,
    ].every(Boolean)
    if (!changeBillingCountry && value != null && value !== "" && value !== val) {
      if (billingAddress.setValue != null) {
        billingAddress?.setValue(name, value)
      }
      setVal(value)
    }
    // On initial country detection, pre-fill the state from the value prop.
    // Fall back to the text input's current DOM value to handle the case where
    // setValue was called externally (e.g. from AddressInput) before country arrived.
    if (changeBillingCountry && isFirstCountryDetection) {
      // textInputRef.current is always mounted here (countryCode is still "" at this point).
      // The ?? "" fallback is a defensive guard for the unreachable case where both are absent.
      const rawStateValue = value ?? textInputRef.current?.value
      /* v8 ignore next */
      const stateValue = String(rawStateValue ?? "")
      if (stateValue !== "") {
        if (billingAddress.setValue != null) billingAddress.setValue(name, stateValue)
        setVal(stateValue)
      }
    }
    // On user-initiated country change, reset the state only if the current value
    // is invalid for the newly selected country (and the country has states).
    if (
      changeBillingCountry &&
      !isFirstCountryDetection &&
      billingCountryCode &&
      !isValidState({
        stateCode: val ?? "",
        countryCode: billingCountryCode,
        states,
      }) &&
      !isEmptyStates()
    ) {
      if (billingAddress.resetField) billingAddress?.resetField(name)
      setVal("")
    }
    const changeShippingCountry = [
      !isEmpty(shippingAddress),
      shippingCountryCode,
      countryCode !== shippingCountryCode,
    ].every(Boolean)
    if (!changeShippingCountry && value != null && value !== "" && value !== val) {
      if (shippingAddress.setValue != null) {
        shippingAddress?.setValue(name, value)
      }
      setVal(value)
    }
    if (changeShippingCountry && isFirstCountryDetection) {
      const rawStateValue = value ?? textInputRef.current?.value
      /* v8 ignore next */
      const stateValue = String(rawStateValue ?? "")
      if (stateValue !== "") {
        if (shippingAddress.setValue != null) shippingAddress.setValue(name, stateValue)
        setVal(stateValue)
      }
    }
    if (
      changeShippingCountry &&
      !isFirstCountryDetection &&
      shippingCountryCode &&
      !isValidState({
        stateCode: val ?? "",
        countryCode: shippingCountryCode,
        states,
      }) &&
      !isEmptyStates()
    ) {
      if (shippingAddress.resetField) shippingAddress?.resetField(name)
      setVal("")
    }
    if (!isEmpty(billingAddress)) {
      const fieldError = billingAddress?.errors?.[name]?.error
      if (!fieldError) setHasError(false)
      else setHasError(true)
    }
    if (!isEmpty(customerAddress)) {
      const fieldError = customerAddress?.errors?.[name]?.error
      if (!fieldError) setHasError(false)
      else setHasError(true)
    }
    if (!isEmpty(shippingAddress)) {
      const fieldError = shippingAddress?.errors?.[name]?.error
      if (!fieldError) setHasError(false)
      else setHasError(true)
    }
    return () => {
      setHasError(false)
    }
  }, [
    value,
    billingAddress?.values?.[BILLING_COUNTRY_KEY],
    shippingAddress?.values?.[SHIPPING_COUNTRY_KEY],
    customerAddress,
  ])
  const errorClassName =
    billingAddress?.errorClassName ||
    shippingAddress?.errorClassName ||
    customerAddress?.errorClassName ||
    ""
  const classNameComputed = !isEmptyStates()
    ? `${className} ${selectClassName} ${hasError ? errorClassName : ""}`
    : `${className} ${inputClassName} ${hasError ? errorClassName : ""}`
  return !isEmptyStates() ? (
    <BaseSelect
      {...p}
      placeholder={selectPlaceholder}
      className={classNameComputed}
      required={required}
      options={stateOptions}
      name={name}
      value={val}
      onChange={(e) => {
        const selected = e.target.value
        setVal(selected)
        if (billingAddress.setValue != null) {
          billingAddress.setValue(name, selected)
        }
        if (shippingAddress.setValue != null) {
          shippingAddress.setValue(name, selected)
        }
      }}
    />
  ) : (
    <BaseInput
      // Spread passthrough props (data-testid, aria-*, disabled, ...) on the
      // input branch too — they must survive the select/input swap.
      {...(p as unknown as Omit<ComponentProps<typeof BaseInput>, "children" | "ref">)}
      ref={textInputRef}
      name={name}
      className={classNameComputed}
      required={required}
      placeholder={inputPlaceholder ?? ""}
      defaultValue={val}
      type="text"
      onChange={(e) => {
        setVal(e.target.value)
        if (billingAddress.setValue != null) {
          billingAddress.setValue(name, e.target.value)
        }
        if (shippingAddress.setValue != null) {
          shippingAddress.setValue(name, e.target.value)
        }
      }}
    />
  )
}

export default AddressStateSelector
