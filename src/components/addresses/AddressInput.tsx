import { useContext, useEffect, useState } from 'react'
import BaseInput from '#components-utils/BaseInput'
import components from '#config/components'
import { BaseInputComponentProps, AddressInputName } from '#typings'
import BillingAddressFormContext, {
  AddressValuesKeys,
} from '#context/BillingAddressFormContext'
import ShippingAddressFormContext from '#context/ShippingAddressFormContext'
import isEmpty from 'lodash/isEmpty'
import { businessMandatoryField } from '#utils/validateFormFields'
import CustomerAddressFormContext from '#context/CustomerAddressFormContext'

const propTypes = components.AddressInput.propTypes
const displayName = components.AddressInput.displayName

type Props = {
  name: Extract<AddressValuesKeys, AddressInputName>
} & Omit<BaseInputComponentProps, 'name'> &
  JSX.IntrinsicElements['input'] &
  JSX.IntrinsicElements['textarea']

export function AddressInput(props: Props) {
  const { placeholder = '', required, value, className, ...p } = props
  const billingAddress = useContext(BillingAddressFormContext)
  const shippingAddress = useContext(ShippingAddressFormContext)
  const customerAddress = useContext(CustomerAddressFormContext)
  const [hasError, setHasError] = useState(false)
  useEffect(() => {
    if (value && billingAddress?.setValue) {
      billingAddress.setValue(p.name, value)
    }
    if (value && shippingAddress?.setValue) {
      shippingAddress.setValue(p.name, value)
    }
    if (value && customerAddress?.setValue) {
      customerAddress.setValue(p.name, value)
    }

    if (billingAddress.errors && billingAddress?.errors?.[p.name]?.error) {
      setHasError(true)
    }
    if (billingAddress && isEmpty(billingAddress?.errors?.[p.name]) && hasError)
      setHasError(false)

    if (customerAddress.errors && customerAddress?.errors?.[p.name]?.error) {
      setHasError(true)
    }
    if (isEmpty(customerAddress?.errors?.[p.name]) && hasError)
      setHasError(false)

    if (
      shippingAddress.errors &&
      shippingAddress?.errors?.[p.name]?.['error']
    ) {
      setHasError(true)
    }
    if (
      shippingAddress &&
      isEmpty(shippingAddress?.errors?.[p.name]) &&
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
  const classNameComputed = `${className ? className : ''} ${
    hasError && errorClassName ? errorClassName : ''
  }`
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
