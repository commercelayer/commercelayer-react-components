import { useContext, useEffect, useMemo } from 'react'
import BaseInput from '#components/utils/BaseInput'
import { type BaseInputComponentProps, type AddressInputName } from '#typings'
import BillingAddressFormContext, {
  type AddressValuesKeys
} from '#context/BillingAddressFormContext'
import ShippingAddressFormContext from '#context/ShippingAddressFormContext'
import { businessMandatoryField } from '#utils/validateFormFields'
import CustomerAddressFormContext from '#context/CustomerAddressFormContext'

type Props = {
  name: Extract<AddressValuesKeys, AddressInputName>
} & Omit<BaseInputComponentProps, 'name'> &
  JSX.IntrinsicElements['input'] &
  Omit<JSX.IntrinsicElements['textarea'], 'children'>

export function AddressInput(props: Props): JSX.Element | null {
  const { placeholder = '', required, value, className, ...p } = props
  const billingAddress = useContext(BillingAddressFormContext)
  const shippingAddress = useContext(ShippingAddressFormContext)
  const customerAddress = useContext(CustomerAddressFormContext)
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
  }, [value])

  const hasError = useMemo(() => {
    if (billingAddress?.errors?.[p.name]?.error) {
      return true
    }
    if (shippingAddress?.errors?.[p.name]?.error) {
      return true
    }
    if (customerAddress?.errors?.[p.name]?.error) {
      return true
    }
    return false
  }, [
    value,
    billingAddress?.errors,
    shippingAddress?.errors,
    customerAddress?.errors
  ])

  const mandatoryField = billingAddress?.isBusiness
    ? businessMandatoryField(p.name, billingAddress.isBusiness)
    : businessMandatoryField(p.name, shippingAddress.isBusiness)
  const reqField = required !== undefined ? required : mandatoryField
  const errorClassName =
    billingAddress?.errorClassName || shippingAddress?.errorClassName
  const classNameComputed = `${className || ''} ${
    hasError && errorClassName ? errorClassName : ''
  }`
  if (
    p.name === 'billing_address_billing_info' &&
    billingAddress.requiresBillingInfo === false &&
    required === undefined
  )
    return null
  return (
    <BaseInput
      ref={
        (billingAddress?.validation as any) ||
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

export default AddressInput
