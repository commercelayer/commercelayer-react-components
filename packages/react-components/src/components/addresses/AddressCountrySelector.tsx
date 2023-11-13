import { useContext, useEffect, useMemo } from 'react'
import BaseSelect from '../utils/BaseSelect'
import { type BaseSelectComponentProps } from '#typings'
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
