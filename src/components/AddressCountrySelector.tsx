import React, {
  FunctionComponent,
  useContext,
  useEffect,
  useState,
} from 'react'
import BaseSelect from './utils/BaseSelect'
import countriesOptions from '#config/countries.json'
import components from '#config/components'
import { AddressCountrySelectName, BaseSelectComponentProps } from '#typings'
import BillingAddressFormContext from '#context/BillingAddressFormContext'
import ShippingAddressFormContext from '#context/ShippingAddressFormContext'
import isEmpty from 'lodash/isEmpty'

const propTypes = components.AddressCountrySelector.propTypes
const defaultProps = components.AddressCountrySelector.defaultProps
const displayName = components.AddressCountrySelector.displayName

type AddressCountrySelectorProps = Omit<
  BaseSelectComponentProps,
  'options' | 'name'
> & {
  name: AddressCountrySelectName
  required?: boolean
  disabled?: boolean
} & Pick<JSX.IntrinsicElements['select'], 'className' | 'id' | 'style'>

const AddressCountrySelector: FunctionComponent<AddressCountrySelectorProps> = (
  props
) => {
  const { required = true, value, name, className, ...p } = props
  const billingAddress = useContext(BillingAddressFormContext)
  const shippingAddress = useContext(ShippingAddressFormContext)
  const [hasError, setHasError] = useState(false)
  useEffect(() => {
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
  }, [value, billingAddress?.errors, shippingAddress?.errors])
  const errorClassName =
    billingAddress?.errorClassName || shippingAddress?.errorClassName
  const classNameComputed = `${className} ${hasError ? errorClassName : ''}`
  return (
    <BaseSelect
      className={classNameComputed}
      ref={billingAddress?.validation || shippingAddress?.validation}
      required={required}
      options={countriesOptions}
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
