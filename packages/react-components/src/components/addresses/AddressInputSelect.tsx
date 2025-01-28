import { useContext, useEffect, useMemo, type JSX } from 'react';
import BaseSelect from '../utils/BaseSelect'
import type { BaseSelectComponentProps } from '#typings'
import BillingAddressFormContext, {
  type AddressValuesKeys
} from '#context/BillingAddressFormContext'
import ShippingAddressFormContext from '#context/ShippingAddressFormContext'

type SelectFieldName =
  | `billing_address_${`metadata_${string}`}`
  | `shipping_address_${`metadata_${string}`}`

interface Props
  extends Omit<BaseSelectComponentProps, 'name'>,
    Pick<JSX.IntrinsicElements['select'], 'className' | 'id' | 'style'> {
  name: Extract<AddressValuesKeys, SelectFieldName>
  required?: boolean
  disabled?: boolean
}

/**
 * The AddressInputSelect component creates a form `select` related to the `metadata` attribute of the `address` object.
 *
 * It requires a `name` prop to define the field name associated with the select and accepts most of HTML `select` tag standard props.
 *
 * <span title="Name prop" type="info">
 * The `name` prop must respect the convention of mentioning one of the available addresses forms (`billing_address` or `shipping_address`) concatenated to the `metadata` address attribute with a `_` separator. Eg.: `billing_address_metadata_your-key`.
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
export function AddressInputSelect(props: Props): JSX.Element {
  const { required = true, value, name, className, options, ...p } = props
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

  const hasError = useMemo(() => {
    if (billingAddress?.errors?.[name]?.error) {
      return true
    }
    if (shippingAddress?.errors?.[name]?.error) {
      return true
    }
    return false
  }, [value, billingAddress?.errors, shippingAddress?.errors])
  const errorClassName =
    billingAddress?.errorClassName || shippingAddress?.errorClassName
  const classNameComputed = `${className ?? ''} ${
    hasError && errorClassName ? errorClassName : ''
  }`
  return (
    <BaseSelect
      className={classNameComputed}
      ref={(billingAddress?.validation as any) || shippingAddress?.validation}
      required={required}
      options={options}
      name={name}
      value={value}
      {...p}
    />
  )
}

export default AddressInputSelect
