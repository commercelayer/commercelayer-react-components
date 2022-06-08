import { FunctionComponent, useContext, useEffect, useState } from 'react'
import BaseSelect from './utils/BaseSelect'
import components from '#config/components'
import { AddressStateSelectName, BaseSelectComponentProps } from '#typings'
import BillingAddressFormContext from '#context/BillingAddressFormContext'
import ShippingAddressFormContext from '#context/ShippingAddressFormContext'
import isEmpty from 'lodash/isEmpty'
import { getStateOfCountry, isValidState } from '#utils/countryStateCity'
import isEmptyStates from '#utils/isEmptyStates'
import AddressesContext from '#context/AddressContext'
import BaseInput from './utils/BaseInput'

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
  inputClassName?: string
  selectClassName?: string
} & Pick<JSX.IntrinsicElements['select'], 'className' | 'id' | 'style'>

const AddressStateSelector: FunctionComponent<AddressStateSelectorProps> = (
  props
) => {
  const {
    required = true,
    value,
    name,
    className,
    inputClassName,
    selectClassName,
    ...p
  } = props
  const billingAddress = useContext(BillingAddressFormContext)
  const shippingAddress = useContext(ShippingAddressFormContext)
  const { errors: addressErrors } = useContext(AddressesContext)
  const [hasError, setHasError] = useState(false)
  const [countryCode, setCountryCode] = useState('')
  const [val, setVal] = useState(value || '')
  useEffect(() => {
    const billingCountryCode =
      billingAddress?.values?.['billing_address_country_code']?.value ||
      billingAddress?.values?.['country_code']
    if (!isEmpty(billingCountryCode) && billingCountryCode !== countryCode)
      setCountryCode(billingCountryCode)
    const shippingCountryCode =
      shippingAddress?.values?.['shipping_address_country_code']?.value
    if (!isEmpty(shippingCountryCode) && shippingCountryCode !== countryCode)
      setCountryCode(shippingCountryCode)
    const changeBillingCountry = [
      !isEmpty(billingAddress),
      billingCountryCode,
      countryCode !== billingCountryCode,
    ].every(Boolean)
    if (
      changeBillingCountry &&
      !isValidState(val, billingCountryCode) &&
      !isEmptyStates(billingCountryCode)
    ) {
      billingAddress.resetField && billingAddress.resetField(name)
      setVal('')
    }
    const changeShippingCountry = [
      !isEmpty(shippingAddress),
      shippingCountryCode,
      countryCode !== shippingCountryCode,
    ].every(Boolean)
    if (
      changeShippingCountry &&
      !isValidState(val, shippingCountryCode) &&
      !isEmptyStates(shippingCountryCode)
    ) {
      shippingAddress.resetField && shippingAddress.resetField(name)
      setVal('')
    }
    if (!isEmpty(billingAddress)) {
      const fieldError = billingAddress?.errors?.[name as any]?.['error']
      if (!fieldError) setHasError(false)
      else setHasError(true)
    }
    if (!isEmpty(shippingAddress)) {
      const fieldError = shippingAddress?.errors?.[name as any]?.['error']
      if (!fieldError) setHasError(false)
      else setHasError(true)
    }
    return () => {
      setHasError(false)
    }
  }, [value, billingAddress, shippingAddress, addressErrors])
  const errorClassName =
    billingAddress?.errorClassName || shippingAddress?.errorClassName
  const classNameComputed = !isEmptyStates(countryCode)
    ? `${className} ${selectClassName} ${hasError ? errorClassName : ''}`
    : `${className} ${inputClassName} ${hasError ? errorClassName : ''}`
  return !isEmptyStates(countryCode) ? (
    <BaseSelect
      {...p}
      className={classNameComputed}
      ref={billingAddress?.validation || shippingAddress?.validation}
      required={required}
      options={getStateOfCountry(countryCode)}
      name={name}
      value={val}
    />
  ) : (
    <BaseInput
      {...(p as any)}
      name={name}
      ref={billingAddress?.validation || shippingAddress?.validation}
      className={classNameComputed}
      required={required}
      placeholder={p.placeholder?.label || ''}
      defaultValue={val}
      type="text"
    />
  )
}

AddressStateSelector.propTypes = propTypes
AddressStateSelector.defaultProps = defaultProps
AddressStateSelector.displayName = displayName

export default AddressStateSelector
