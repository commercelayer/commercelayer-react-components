import { FunctionComponent, useContext, useEffect, useState } from 'react'
import BaseInput from './utils/BaseInput'
import components from '#config/components'
import { BaseInputComponentProps, AddressInputName } from '#typings'
import BillingAddressFormContext from '#context/BillingAddressFormContext'
import ShippingAddressFormContext from '#context/ShippingAddressFormContext'
import isEmpty from 'lodash/isEmpty'
import { businessMandatoryField } from '#utils/validateFormFields'

const propTypes = components.AddressInput.propTypes
const displayName = components.AddressInput.displayName

export type AddressInputProps = {
  name: AddressInputName
} & Omit<BaseInputComponentProps, 'name'> &
  JSX.IntrinsicElements['input'] &
  JSX.IntrinsicElements['textarea']

const AddressInput: FunctionComponent<AddressInputProps> = (props) => {
  const { placeholder = '', required, value, className, ...p } = props
  const billingAddress = useContext(BillingAddressFormContext)
  const shippingAddress = useContext(ShippingAddressFormContext)
  const [hasError, setHasError] = useState(false)
  useEffect(() => {
    if (value && billingAddress?.setValue) {
      billingAddress.setValue(p.name, value)
    }
    if (value && shippingAddress?.setValue) {
      shippingAddress.setValue(p.name, value)
    }
    if (
      !isEmpty(billingAddress.errors) &&
      billingAddress?.errors?.[p.name as any]?.['error']
    ) {
      setHasError(true)
    }
    if (
      !isEmpty(billingAddress) &&
      isEmpty(billingAddress?.errors?.[p.name as any]) &&
      hasError
    )
      setHasError(false)

    if (
      !isEmpty(shippingAddress.errors) &&
      shippingAddress?.errors?.[p.name as any]?.['error']
    ) {
      setHasError(true)
    }
    if (
      !isEmpty(shippingAddress) &&
      isEmpty(shippingAddress?.errors?.[p.name as any]) &&
      hasError
    )
      setHasError(false)

    return () => {
      setHasError(false)
    }
  }, [value, billingAddress?.errors, shippingAddress?.errors])
  const mandatoryField = billingAddress?.isBusiness
    ? businessMandatoryField(p.name, billingAddress.isBusiness)
    : businessMandatoryField(p.name, shippingAddress.isBusiness)
  const reqField = required !== undefined ? required : mandatoryField
  const errorClassName =
    billingAddress?.errorClassName || shippingAddress?.errorClassName
  const classNameComputed = `${className} ${hasError ? errorClassName : ''}`
  if (
    p.name === 'billing_address_billing_info' &&
    !billingAddress.requiresBillingInfo
  )
    return null
  return (
    <BaseInput
      ref={
        billingAddress?.validation ||
        shippingAddress?.validation ||
        customerAddress?.validation
      }
      className={classNameComputed}
      required={reqField}
      placeholder={placeholder}
      defaultValue={value}
      {...p}
    />
  )
}

AddressInput.propTypes = propTypes
AddressInput.displayName = displayName

export default AddressInput
