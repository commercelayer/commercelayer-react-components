import { useContext, useEffect, useState } from 'react'
import BaseSelect from '#components-utils/BaseSelect'

import { AddressStateSelectName, BaseSelectComponentProps } from '#typings'
import BillingAddressFormContext from '#context/BillingAddressFormContext'
import ShippingAddressFormContext from '#context/ShippingAddressFormContext'
import isEmpty from 'lodash/isEmpty'
import { getStateOfCountry, isValidState } from '#utils/countryStateCity'
import isEmptyStates from '#utils/isEmptyStates'
import AddressesContext from '#context/AddressContext'
import BaseInput from '#components-utils/BaseInput'
import CustomerAddressFormContext from '#context/CustomerAddressFormContext'

type Props = Omit<BaseSelectComponentProps, 'options' | 'name'> & {
  name: AddressStateSelectName
  required?: boolean
  disabled?: boolean
  inputClassName?: string
  selectClassName?: string
} & Pick<JSX.IntrinsicElements['select'], 'className' | 'id' | 'style'>

export function AddressStateSelector(props: Props) {
  const {
    required = true,
    value,
    name,
    className = '',
    inputClassName = '',
    selectClassName = '',
    ...p
  } = props
  const billingAddress = useContext(BillingAddressFormContext)
  const shippingAddress = useContext(ShippingAddressFormContext)
  const customerAddress = useContext(CustomerAddressFormContext)
  const { errors: addressErrors } = useContext(AddressesContext)
  const [hasError, setHasError] = useState(false)
  const [countryCode, setCountryCode] = useState('')
  const [val, setVal] = useState(value || '')
  useEffect(() => {
    const billingCountryCode =
      typeof billingAddress?.values?.['billing_address_country_code'] ===
      'string'
        ? billingAddress?.values?.['billing_address_country_code']
        : billingAddress?.values?.['billing_address_country_code']?.['value']
    if (billingCountryCode && billingCountryCode !== countryCode)
      setCountryCode(billingCountryCode)
    const customerCountryCode =
      customerAddress?.values?.['customer_address_country_code']?.value ||
      customerAddress?.values?.['country_code']
    if (!isEmpty(customerCountryCode) && customerCountryCode !== countryCode)
      setCountryCode(customerCountryCode)
    const shippingCountryCode =
      typeof shippingAddress?.values?.['shipping_address_country_code'] ===
      'string'
        ? shippingAddress?.values?.['shipping_address_country_code']
        : shippingAddress?.values?.['shipping_address_country_code']?.value
    if (shippingCountryCode && shippingCountryCode !== countryCode)
      setCountryCode(shippingCountryCode)
    const changeBillingCountry = [
      Object.keys(billingAddress).length > 0,
      billingCountryCode,
      countryCode !== billingCountryCode,
    ].every(Boolean)
    if (
      changeBillingCountry &&
      billingCountryCode &&
      !isValidState(val, billingCountryCode) &&
      !isEmptyStates(billingCountryCode)
    ) {
      billingAddress.resetField && billingAddress.resetField(name)
      setVal('')
    }
    const changeCustomerCountry = [
      !isEmpty(customerAddress),
      customerCountryCode,
      countryCode !== customerCountryCode,
    ].every(Boolean)
    if (changeCustomerCountry && !isValidState(val, customerCountryCode)) {
      customerAddress.resetField && customerAddress.resetField(name)
      setVal('')
    }
    const changeShippingCountry = [
      !isEmpty(shippingAddress),
      shippingCountryCode,
      countryCode !== shippingCountryCode,
    ].every(Boolean)
    if (
      changeShippingCountry &&
      shippingCountryCode &&
      !isValidState(val, shippingCountryCode) &&
      !isEmptyStates(shippingCountryCode)
    ) {
      shippingAddress.resetField && shippingAddress.resetField(name)
      setVal('')
    }
    if (!isEmpty(billingAddress)) {
      const fieldError = billingAddress?.errors?.[name]?.['error']
      if (!fieldError) setHasError(false)
      else setHasError(true)
    }
    if (!isEmpty(customerAddress)) {
      const fieldError = customerAddress?.errors?.[name]?.error
      if (!fieldError) setHasError(false)
      else setHasError(true)
    }
    if (!isEmpty(customerAddress)) {
      const fieldError = customerAddress?.errors?.[name as any]?.error
      if (!fieldError) setHasError(false)
      else setHasError(true)
    }
    if (!isEmpty(shippingAddress)) {
      const fieldError = shippingAddress?.errors?.[name]?.['error']
      if (!fieldError) setHasError(false)
      else setHasError(true)
    }
    return () => {
      setHasError(false)
    }
  }, [value, billingAddress, shippingAddress, addressErrors, customerAddress])
  const errorClassName =
    billingAddress?.errorClassName ||
    shippingAddress?.errorClassName ||
    customerAddress?.errorClassName ||
    ''
  const classNameComputed = !isEmptyStates(countryCode)
    ? `${className} ${selectClassName} ${hasError ? errorClassName : ''}`
    : `${className} ${inputClassName} ${hasError ? errorClassName : ''}`
  return !isEmptyStates(countryCode) ? (
    <BaseSelect
      {...p}
      className={classNameComputed}
      ref={
        (billingAddress?.validation as any) ||
        shippingAddress?.validation ||
        customerAddress?.validation
      }
      required={required}
      options={getStateOfCountry(countryCode)}
      name={name}
      value={val}
    />
  ) : (
    <BaseInput
      {...(p as any)}
      name={name}
      ref={
        (billingAddress?.validation as any) ||
        shippingAddress?.validation ||
        customerAddress?.validation
      }
      className={classNameComputed}
      required={required}
      placeholder={p.placeholder?.label || ''}
      defaultValue={val}
      type="text"
    />
  )
}

export default AddressStateSelector
