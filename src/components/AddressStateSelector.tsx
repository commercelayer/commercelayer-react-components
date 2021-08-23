import React, {
  FunctionComponent,
  useContext,
  useEffect,
  useState,
} from 'react'
import BaseSelect from './utils/BaseSelect'
import components from '#config/components'
import { AddressStateSelectName, BaseSelectComponentProps } from '#typings'
import BillingAddressFormContext from '#context/BillingAddressFormContext'
import ShippingAddressFormContext from '#context/ShippingAddressFormContext'
import isEmpty from 'lodash/isEmpty'
import { getStateOfCountry } from '#utils/countryStateCity'

const propTypes = components.AddressStateSelector.propTypes
const defaultProps = components.AddressStateSelector.defaultProps
const displayName = components.AddressStateSelector.displayName

type AddressStateSelectorProps = Omit<
  BaseSelectComponentProps,
  'options' | 'name'
> & {
  name: AddressStateSelectName
  required?: boolean
  disabled?: boolean
} & Pick<JSX.IntrinsicElements['select'], 'className' | 'id' | 'style'>

const AddressStateSelector: FunctionComponent<AddressStateSelectorProps> = (
  props
) => {
  const { required = true, value, name, className, ...p } = props
  const billingAddress = useContext(BillingAddressFormContext)
  const shippingAddress = useContext(ShippingAddressFormContext)
  const [hasError, setHasError] = useState(false)
  const [countryCode, setCountryCode] = useState('')
  const [val, setVal] = useState(value)
  useEffect(() => {
    const billingCountryCode =
      billingAddress?.values?.['billing_address_country_code']?.value
    const shippingCountryCode =
      shippingAddress?.values?.['shipping_address_country_code']?.value
    const changeBillingCountry = [
      !isEmpty(billingAddress),
      billingCountryCode,
      countryCode !== billingCountryCode,
    ].every(Boolean)
    if (changeBillingCountry) {
      setCountryCode(billingCountryCode)
      billingAddress.resetField && billingAddress.resetField(name)
      setVal('')
    }
    const changeShippingCountry = [
      !isEmpty(shippingAddress),
      shippingCountryCode,
      countryCode !== shippingCountryCode,
    ].every(Boolean)
    if (changeShippingCountry) {
      setCountryCode(shippingCountryCode)
      shippingAddress.resetField && shippingAddress.resetField(name)
      setVal('')
    }
    if (value && billingAddress?.setValue) {
      billingAddress.setValue(name, value)
    }
    if (value && shippingAddress?.setValue) {
      shippingAddress.setValue(name, value)
    }
    if (
      !isEmpty(billingAddress.errors) &&
      billingAddress?.errors?.[name as any]?.error
    ) {
      setHasError(true)
    }
    if (isEmpty(billingAddress?.errors?.[name as any]) && hasError)
      setHasError(false)

    if (
      !isEmpty(shippingAddress.errors) &&
      shippingAddress?.errors?.[name as any]?.error
    ) {
      setHasError(true)
    }
    if (isEmpty(shippingAddress?.errors?.[name as any]) && hasError)
      setHasError(false)

    return () => {
      setHasError(false)
    }
  }, [
    value,
    billingAddress?.errors,
    shippingAddress?.errors,
    billingAddress?.values,
    shippingAddress?.values,
  ])
  const errorClassName =
    billingAddress?.errorClassName || shippingAddress?.errorClassName
  const classNameComputed = `${className} ${hasError ? errorClassName : ''}`
  return (
    <BaseSelect
      className={classNameComputed}
      ref={billingAddress?.validation || shippingAddress?.validation}
      required={required}
      options={getStateOfCountry(countryCode)}
      name={name}
      value={val}
      {...p}
    />
  )
}

AddressStateSelector.propTypes = propTypes
AddressStateSelector.defaultProps = defaultProps
AddressStateSelector.displayName = displayName

export default AddressStateSelector
