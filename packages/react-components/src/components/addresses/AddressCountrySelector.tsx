import { useContext, useEffect, useMemo, type JSX } from 'react';
import BaseSelect from '../utils/BaseSelect'
import type { BaseSelectComponentProps } from '#typings'
import BillingAddressFormContext, {
  type AddressValuesKeys
} from '#context/BillingAddressFormContext'
import ShippingAddressFormContext from '#context/ShippingAddressFormContext'
import { getCountries, type Country } from '#utils/countryStateCity'
import CustomerAddressFormContext from '#context/CustomerAddressFormContext'

type TCountryFieldName =
  | 'billing_address_country_code'
  | 'shipping_address_country_code'
  | 'customer_address_country_code'

interface Props
  extends Omit<BaseSelectComponentProps, 'options' | 'name'>,
    Pick<JSX.IntrinsicElements['select'], 'className' | 'id' | 'style'> {
  name: Extract<AddressValuesKeys, TCountryFieldName>
  required?: boolean
  disabled?: boolean
  /**
   * Optional country list to override default ones.
   */
  countries?: Country[]
}

/**
 * The AddressInput component creates a form `select` related to the `country_code` attribute of the `address` object.
 *
 * It requires a `name` prop to define the field name associated with the select and accepts most of HTML `select` tag standard props.
 *
 * <span title="Name prop" type="info">
 * The `name` prop must respect the convention of mentioning one of the available addresses forms (`billing_address` or `shipping_address` or `customer_address`) concatenated to the `country_code` address attribute with a `_` separator. Eg.: `billing_address_country_code`.
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
export function AddressCountrySelector(props: Props): JSX.Element {
  const { required = true, value, name, className, countries, ...p } = props
  const billingAddress = useContext(BillingAddressFormContext)
  const shippingAddress = useContext(ShippingAddressFormContext)
  const customerAddress = useContext(CustomerAddressFormContext)
  useEffect(() => {
    if (value && billingAddress?.setValue) {
      billingAddress.setValue(name, value)
    }
    if (value && shippingAddress?.setValue) {
      shippingAddress.setValue(name, value)
    }
    if (value && customerAddress?.setValue) {
      customerAddress.setValue(name, value)
    }
  }, [value])

  const hasError = useMemo(() => {
    if (billingAddress?.errors?.[name]?.error) {
      return true
    }
    if (shippingAddress?.errors?.[name]?.error) {
      return true
    }
    if (customerAddress?.errors?.[name]?.error) {
      return true
    }
    return false
  }, [
    value,
    billingAddress?.errors,
    shippingAddress?.errors,
    customerAddress?.errors
  ])
  const errorClassName =
    billingAddress?.errorClassName ||
    shippingAddress?.errorClassName ||
    customerAddress?.errorClassName
  const classNameComputed = `${className ?? ''} ${
    hasError && errorClassName ? errorClassName : ''
  }`
  return (
    <BaseSelect
      className={classNameComputed}
      ref={
        (billingAddress?.validation as any) ||
        shippingAddress?.validation ||
        customerAddress?.validation
      }
      required={required}
      options={getCountries(countries)}
      name={name}
      value={value}
      {...p}
    />
  )
}

export default AddressCountrySelector
