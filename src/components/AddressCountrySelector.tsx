import React, { FunctionComponent, useContext, useEffect } from 'react'
import BaseSelect from './utils/BaseSelect'
import countriesOptions from '#config/countries.json'
import components from '#config/components'
import { AddressCountrySelectName, BaseSelectComponentProps } from '#typings'
import BillingAddressFormContext from '#context/BillingAddressFormContext'
import ShippingAddressFormContext from '#context/ShippingAddressFormContext'

const propTypes = components.AddressCountrySelector.propTypes
const defaultProps = components.AddressCountrySelector.defaultProps
const displayName = components.AddressCountrySelector.displayName

type AddressCountrySelectorProps = Omit<
  BaseSelectComponentProps,
  'options' | 'name'
> & {
  name: AddressCountrySelectName
  required?: boolean
} & Pick<JSX.IntrinsicElements['select'], 'className' | 'id' | 'style'>

const AddressCountrySelector: FunctionComponent<AddressCountrySelectorProps> = (
  props
) => {
  const { required = true, value, name } = props
  const billingAddress = useContext(BillingAddressFormContext)
  const shippingAddress = useContext(ShippingAddressFormContext)
  useEffect(() => {
    if (value && billingAddress?.setValue) {
      billingAddress.setValue(name, value)
    }
    if (value && shippingAddress?.setValue) {
      shippingAddress.setValue(name, value)
    }
  }, [value])
  return (
    <BaseSelect
      ref={billingAddress?.validation || shippingAddress?.validation}
      required={required}
      options={countriesOptions}
      {...props}
    />
  )
}

AddressCountrySelector.propTypes = propTypes
AddressCountrySelector.defaultProps = defaultProps
AddressCountrySelector.displayName = displayName

export default AddressCountrySelector
