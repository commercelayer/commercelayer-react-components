import React, {
  FunctionComponent,
  useContext,
  useEffect,
  useState,
} from 'react'
import BaseInput from './utils/BaseInput'
import components from '#config/components'
import { BaseInputComponentProps, AddressInputName } from '#typings'
import BillingAddressFormContext from '#context/BillingAddressFormContext'
import ShippingAddressFormContext from '#context/ShippingAddressFormContext'
import isEmpty from 'lodash/isEmpty'
import CustomerAddressFormContext from '#context/CustomerAddressFormContext'

const propTypes = components.AddressInput.propTypes
const displayName = components.AddressInput.displayName

type CustomerOptionalField = Extract<
  AddressInputName,
  | 'billing_address_line_2'
  | 'billing_address_company'
  | 'shipping_address_line_2'
  | 'shipping_address_company'
>

type BusinessOptionalField = Extract<
  AddressInputName,
  | 'billing_address_first_name'
  | 'billing_address_last_name'
  | 'shipping_address_first_name'
  | 'shipping_address_last_name'
>

const businessOptionalFields: BusinessOptionalField[] = [
  'billing_address_first_name',
  'billing_address_last_name',
  'shipping_address_first_name',
  'shipping_address_last_name',
]

const customerOptionalFields: CustomerOptionalField[] = [
  'billing_address_company',
  'shipping_address_company',
  'billing_address_line_2',
  'shipping_address_line_2',
]

export type AddressInputProps = {
  name: AddressInputName
} & Omit<BaseInputComponentProps, 'name'> &
  JSX.IntrinsicElements['input'] &
  JSX.IntrinsicElements['textarea']

const AddressInput: FunctionComponent<AddressInputProps> = (props) => {
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

    if (
      !isEmpty(billingAddress.errors) &&
      billingAddress?.errors?.[p.name as any]?.error
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
      !isEmpty(customerAddress.errors) &&
      customerAddress?.errors?.[p.name as any]?.error
    ) {
      setHasError(true)
    }
    if (isEmpty(customerAddress?.errors?.[p.name as any]) && hasError)
      setHasError(false)

    if (
      !isEmpty(shippingAddress.errors) &&
      shippingAddress?.errors?.[p.name as any]?.error
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
  let mandatoryField = true
  if (
    (billingAddress.isBusiness || shippingAddress.isBusiness) &&
    businessOptionalFields.includes(p.name as BusinessOptionalField)
  ) {
    mandatoryField = false
  }
  if (
    (!billingAddress.isBusiness || !shippingAddress.isBusiness) &&
    customerOptionalFields.includes(p.name as CustomerOptionalField)
  ) {
    mandatoryField = false
  }
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
