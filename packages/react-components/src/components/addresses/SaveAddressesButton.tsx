import { type ReactNode, useContext, useState } from 'react'
import Parent from '#components/utils/Parent'
import { type ChildrenFunction } from '#typings/index'
import AddressContext from '#context/AddressContext'
import {
  countryLockController,
  addressesController
} from '#utils/addressesManager'
import OrderContext from '#context/OrderContext'
import CustomerContext from '#context/CustomerContext'
import isFunction from 'lodash/isFunction'
import { type TCustomerAddress } from '#reducers/CustomerReducer'
import type { Order } from '@commercelayer/sdk'

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
}

export function SaveAddressesButton(props: Props): JSX.Element {
  const {
    children,
    label = 'Continue to delivery',
    resource,
    disabled = false,
    addressId,
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
  console.log('invertAddresses', invertAddresses)
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
    customerEmail = false
  }
  const { billingDisable, shippingDisable } = addressesController({
    invertAddresses,
    billing_address: billingAddress,
    shipping_address: shippingAddress,
    shippingAddressId,
    billingAddressId,
    errors
  })
  const countryLockDisable = countryLockController({
    countryCodeLock: order?.shipping_country_code_lock,
    addresses,
    shipToDifferentAddress,
    billingAddressId,
    billing_address: billingAddress,
    shipping_address: shippingAddress,
    shippingAddressId
  })
  const disable =
    disabled ||
    customerEmail ||
    billingDisable ||
    shippingDisable ||
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
      if (order && saveAddresses != null) {
        response = await saveAddresses(email)
      } else if (createCustomerAddress && billingAddress) {
        const address = { ...billingAddress }
        if (addressId) address.id = addressId
        void createCustomerAddress(address as TCustomerAddress)
        response = {
          success: true
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
        void handleClick()
      }}
      {...p}
    >
      {isFunction(label) ? label() : label}
    </button>
  )
}

export default SaveAddressesButton
