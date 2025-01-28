import { useContext, useEffect, useMemo, type JSX } from 'react';
import BaseInput from '#components/utils/BaseInput'
import type { BaseInputComponentProps, AddressInputName } from '#typings'
import BillingAddressFormContext, {
  type AddressValuesKeys
} from '#context/BillingAddressFormContext'
import ShippingAddressFormContext from '#context/ShippingAddressFormContext'
import { businessMandatoryField } from '#utils/validateFormFields'
import CustomerAddressFormContext from '#context/CustomerAddressFormContext'

type Props = {
  /**
   * The name of the input.
   */
  name: Extract<AddressValuesKeys, AddressInputName>
  /**
   * @deprecated
   * Used to add a custom validation rule. Accept a regex as param.
   */
  pattern?: RegExp
} & Omit<BaseInputComponentProps, 'name'> &
  Omit<JSX.IntrinsicElements['input'], 'pattern'> &
  Omit<JSX.IntrinsicElements['textarea'], 'children' | 'pattern'>

/**
 * The AddressInput component creates a form `input` related to a particular address attribute.
 *
 * It requires a `name` prop to define the field name associated with the input and accepts most of HTML `input` tag standard props.
 *
 * <span title="Name prop" type="info">
 * The `name` prop must respect the convention of mentioning one of the available addresses forms (`billing_address` or `shipping_address` or `customer_address`) concatenated to the address attribute name with a `_` separator. Eg.: `billing_address_first_name`.
 * </span>
 *
 * <span title="Requirement" type="warning">
 * It must to be used inside either the `<BillingAddressForm>` or the `<ShippingAddressForm>` component.
 * </span>
 *
 * <span title="Fields" type="info">
 * Check the `addresses` resource from our [Core API documentation](https://docs.commercelayer.io/core/v/api-reference/addresses/object)
 * for more details about the available attributes to render.
 * </span>
 */
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
  if (
    p.name === 'shipping_address_billing_info' &&
    shippingAddress.requiresBillingInfo === false &&
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
