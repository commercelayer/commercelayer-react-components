import { useContext, useEffect, useState } from 'react'
import BaseSelect from '../utils/BaseSelect'
import components from '#config/components'
import { AddressCountrySelectName, BaseSelectComponentProps } from '#typings'
import BillingAddressFormContext, {
  AddressValuesKeys,
} from '#context/BillingAddressFormContext'
import ShippingAddressFormContext from '#context/ShippingAddressFormContext'
import { getCountries } from '#utils/countryStateCity'
import CustomerAddressFormContext from '#context/CustomerAddressFormContext'

const propTypes = components.AddressCountrySelector.propTypes
const defaultProps = components.AddressCountrySelector.defaultProps
const displayName = components.AddressCountrySelector.displayName

type Props = Omit<BaseSelectComponentProps, 'options' | 'name'> & {
  name: Extract<AddressValuesKeys, AddressCountrySelectName>
  required?: boolean
  disabled?: boolean
} & Pick<JSX.IntrinsicElements['select'], 'className' | 'id' | 'style'>

export function AddressCountrySelector(props: Props) {
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

    if (
      billingAddress.errors &&
      billingAddress?.['errors']?.[name]?.['error']
    ) {
      setHasError(true)
    }
    if (billingAddress?.errors?.[name] && hasError) setHasError(false)
    if (
      customerAddress.errors &&
      customerAddress?.['errors']?.[name]?.['error']
    ) {
      setHasError(true)
    }
    if (customerAddress?.['errors']?.[name] && hasError) setHasError(false)

    if (shippingAddress.errors && shippingAddress?.errors?.[name]?.['error']) {
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
    customerAddress?.errors,
  ])
  const errorClassName =
    billingAddress?.errorClassName ||
    shippingAddress?.errorClassName ||
    customerAddress?.errorClassName
  const classNameComputed = `${className ? className : ''} ${
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

AddressCountrySelector.propTypes = propTypes
AddressCountrySelector.defaultProps = defaultProps
AddressCountrySelector.displayName = displayName

export default AddressCountrySelector
