import { ReactNode, useContext, useState } from 'react'
import Parent from '#components-utils/Parent'
import { ChildrenFunction } from '#typings/index'
import AddressContext from '#context/AddressContext'
import {
  shippingAddressController,
  countryLockController,
  billingAddressController
} from '#utils/addressesManager'
import OrderContext from '#context/OrderContext'
import CustomerContext from '#context/CustomerContext'
import isFunction from 'lodash/isFunction'
import { TCustomerAddress } from '#reducers/CustomerReducer'

interface ChildrenProps extends Omit<Props, 'children'> {}

interface Props extends Omit<JSX.IntrinsicElements['button'], 'children'> {
  children?: ChildrenFunction<ChildrenProps>
  label?: string | ReactNode
  onClick?: () => void
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
    shippingAddressId
  } = useContext(AddressContext)
  const { order } = useContext(OrderContext)
  const { addresses, isGuest, createCustomerAddress } =
    useContext(CustomerContext)
  const [forceDisable, setForceDisable] = useState(disabled)
  const customerEmail = !!(
    !!(isGuest === true || typeof isGuest === 'undefined') &&
    !order?.customer_email
  )
  const billingDisable = billingAddressController({
    billing_address: billingAddress,
    errors,
    billingAddressId,
    requiresBillingInfo: order?.requires_billing_info
  })
  const shippingDisable = shippingAddressController({
    billingDisable,
    errors,
    shipToDifferentAddress,
    shipping_address: shippingAddress,
    shippingAddressId
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
  const handleClick = (): void => {
    if (errors && Object.keys(errors).length === 0 && !disable) {
      setForceDisable(true)
      if (order) {
        saveAddresses()
      } else if (createCustomerAddress && billingAddress) {
        const address = { ...billingAddress }
        if (addressId) address.id = addressId
        void createCustomerAddress(address as TCustomerAddress)
      }
      setForceDisable(false)
      if (onClick) onClick()
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
      onClick={handleClick}
      {...p}
    >
      {isFunction(label) ? label() : label}
    </button>
  )
}

export default SaveAddressesButton
