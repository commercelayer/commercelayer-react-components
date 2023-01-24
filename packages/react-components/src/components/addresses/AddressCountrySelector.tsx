import { useContext, useEffect, useState } from 'react'
import BaseSelect from '../utils/BaseSelect'
import { BaseSelectComponentProps } from '#typings'
import BillingAddressFormContext, {
  AddressValuesKeys
} from '#context/BillingAddressFormContext'
import ShippingAddressFormContext from '#context/ShippingAddressFormContext'
import { getCountries } from '#utils/countryStateCity'
import CustomerAddressFormContext from '#context/CustomerAddressFormContext'

type TCountryFieldName =
  | 'billing_address_country_code'
  | 'shipping_address_country_code'
  | 'customer_address_country_code'

interface Props extends Omit<BaseSelectComponentProps, 'options' | 'name'>, Pick<JSX.IntrinsicElements['select'], 'className' | 'id' | 'style'> {
  name: Extract<AddressValuesKeys, TCountryFieldName>
  required?: boolean
  disabled?: boolean
}

export function AddressCountrySelector(props: Props): JSX.Element {
  const { required = true, value, name, className, ...p } = props
  const billingAddress = useContext(BillingAddressFormContext)
  const shippingAddress = useContext(ShippingAddressFormContext)
  const customerAddress = useContext(CustomerAddressFormContext)
  const [hasError, setHasError] = useState(false)
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

    if (billingAddress.errors && billingAddress?.errors?.[name]?.error) {
      setHasError(true)
    }
    if (billingAddress?.errors?.[name] && hasError) setHasError(false)
    if (customerAddress.errors && customerAddress?.errors?.[name]?.error) {
      setHasError(true)
    }
    if (customerAddress?.errors?.[name] && hasError) setHasError(false)

    if (shippingAddress.errors && shippingAddress?.errors?.[name]?.error) {
      setHasError(true)
    }
    if (shippingAddress?.errors?.[name] && hasError) setHasError(false)

    return () => {
      setHasError(false)
    }
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
      options={getCountries()}
      name={name}
      value={value}
      {...p}
    />
  )
}

export default AddressCountrySelector
