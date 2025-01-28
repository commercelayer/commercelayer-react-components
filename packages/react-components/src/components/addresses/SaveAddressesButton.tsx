import { type ReactNode, useContext, useState, type JSX } from 'react';
import Parent from '#components/utils/Parent'
import type { ChildrenFunction } from '#typings/index'
import AddressContext from '#context/AddressContext'
import {
  countryLockController,
  addressesController
} from '#utils/addressesManager'
import OrderContext from '#context/OrderContext'
import CustomerContext from '#context/CustomerContext'
import isFunction from 'lodash/isFunction'
import type { TCustomerAddress } from '#reducers/CustomerReducer'
import type { Order } from '@commercelayer/sdk'
import { validateValue } from '#utils/validateFormFields'
import { formCleaner } from '#utils/formCleaner'

interface TOnClick {
  success: boolean
  order?: Order
}

interface ChildrenProps extends Omit<Props, 'children'> {}

interface Props
  extends Omit<JSX.IntrinsicElements['button'], 'children' | 'onClick'> {
  children?: ChildrenFunction<ChildrenProps>
  label?: string | ReactNode
  onClick?: (params: TOnClick) => void
  addressId?: string
  requiredMetadataFields?: string[]
}

export function SaveAddressesButton(props: Props): JSX.Element {
  const {
    children,
    label = 'Continue to delivery',
    resource,
    disabled = false,
    addressId,
    requiredMetadataFields,
    onClick,
    ...p
  } = props
  const {
    errors,
    billing_address: billingAddress,
    shipToDifferentAddress,
    shipping_address: shippingAddress,
    saveAddresses,
    billingAddressId,
    shippingAddressId,
    invertAddresses
  } = useContext(AddressContext)
  const { order } = useContext(OrderContext)
  const {
    customerEmail: email,
    addresses,
    isGuest,
    createCustomerAddress
  } = useContext(CustomerContext)
  const [forceDisable, setForceDisable] = useState(disabled)
  let customerEmail = !!(
    !!(isGuest === true || typeof isGuest === 'undefined') &&
    !order?.customer_email
  )
  if (email != null && email !== '') {
    const isValidEmail = validateValue(
      email,
      'customer_email',
      'email',
      'orders'
    )
    customerEmail = Object.keys(isValidEmail).length > 0
  }
  const shippingAddressCleaned: any = Object.keys(shippingAddress ?? {}).reduce(
    (acc, key) => {
      return {
        ...acc,
        // @ts-expect-error type mismatch
        [key.replace(`shipping_address_`, '')]: shippingAddress[key].value
      }
    },
    {}
  )
  const { billingDisable, shippingDisable } = addressesController({
    invertAddresses,
    requiresBillingInfo: order?.requires_billing_info,
    billing_address: billingAddress,
    shipping_address: shippingAddressCleaned,
    shipToDifferentAddress,
    shippingAddressId,
    billingAddressId,
    errors,
    requiredMetadataFields
  })
  const countryLockDisable = countryLockController({
    countryCodeLock: order?.shipping_country_code_lock,
    addresses,
    shipToDifferentAddress,
    billingAddressId,
    billing_address: billingAddress,
    shipping_address: shippingAddress,
    shippingAddressId,
    lineItems: order?.line_items
  })
  // NOTE: This is a temporary fix to avoid the button to be disabled when the user is editing an address
  const invertAddressesDisable =
    invertAddresses && shippingAddressId ? false : shippingDisable
  const disable =
    disabled ||
    customerEmail ||
    billingDisable ||
    invertAddressesDisable ||
    countryLockDisable

  const handleClick = async (): Promise<void> => {
    if (errors && Object.keys(errors).length === 0 && !disable) {
      let response: {
        success: boolean
        order?: Order
      } = {
        success: false
      }
      setForceDisable(true)
      // eslint-disable-next-line @typescript-eslint/switch-exhaustiveness-check
      switch (true) {
        case order != null &&
          addressId != null &&
          createCustomerAddress != null &&
          saveAddresses != null: {
          response = await saveAddresses({
            customerEmail: email,
            customerAddress: {
              resource: invertAddresses
                ? 'shipping_address'
                : 'billing_address',
              id: addressId
            }
          })
          break
        }
        case order != null && saveAddresses != null: {
          response = await saveAddresses({
            customerEmail: email
          })
          break
        }
        case createCustomerAddress != null: {
          const address = invertAddresses
            ? { ...formCleaner(shippingAddress) }
            : { ...formCleaner(billingAddress) }
          if (addressId) address.id = addressId
          createCustomerAddress(address as TCustomerAddress)
          response = {
            success: true
          }
          break
        }
      }
      setForceDisable(false)
      if (onClick && response.success) onClick(response)
    }
  }

  const parentProps = {
    ...p,
    label,
    resource,
    handleClick,
    disabled: disable
  }
  return children ? (
    <Parent {...parentProps}>{children}</Parent>
  ) : (
    <button
      type='button'
      disabled={disable || forceDisable}
      onClick={() => {
        handleClick()
      }}
      {...p}
    >
      {isFunction(label) ? label() : label}
    </button>
  )
}

export default SaveAddressesButton
