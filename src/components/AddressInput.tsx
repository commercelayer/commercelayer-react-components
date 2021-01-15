import React, { FunctionComponent, useContext, useEffect } from 'react'
import BaseInput from './utils/BaseInput'
import components from '@config/components'
import { BaseInputComponentProps, AddressInputName } from '@typings'
import BillingAddressFormContext from '@context/BillingAddressFormContext'
import ShippingAddressFormContext from '@context/ShippingAddressFormContext'

const propTypes = components.AddressInput.propTypes
const displayName = components.AddressInput.displayName

export type AddressInputProps = {
  name: AddressInputName
} & Omit<BaseInputComponentProps, 'name'> &
  JSX.IntrinsicElements['input'] &
  JSX.IntrinsicElements['textarea']

const AddressInput: FunctionComponent<AddressInputProps> = (props) => {
  const { placeholder = '', required, value, ...p } = props
  const billingAddress = useContext(BillingAddressFormContext)
  const shippingAddress = useContext(ShippingAddressFormContext)
  useEffect(() => {
    if (value && billingAddress?.setValue) {
      billingAddress.setValue(p.name, value)
    }
    if (value && shippingAddress?.setValue) {
      shippingAddress.setValue(p.name, value)
    }
  }, [value])
  return (
    <BaseInput
      ref={billingAddress?.validation || shippingAddress?.validation}
      required={required !== undefined ? required : true}
      placeholder={placeholder}
      defaultValue={value}
      {...p}
    />
  )
}

AddressInput.propTypes = propTypes
AddressInput.displayName = displayName

export default AddressInput
