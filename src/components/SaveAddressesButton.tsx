import { ReactNode, useContext, useState } from 'react'
import Parent from './utils/Parent'
import components from '#config/components'
import { FunctionChildren } from '#typings/index'
import AddressContext from '#context/AddressContext'
import {
  shippingAddressController,
  countryLockController,
  billingAddressController,
} from '#utils/addressesManager'
import OrderContext from '#context/OrderContext'
import CustomerContext from '#context/CustomerContext'
import isFunction from 'lodash/isFunction'
import { TCustomerAddress } from '#reducers/CustomerReducer'

const propTypes = components.SaveAddressesButton.propTypes
const defaultProps = components.SaveAddressesButton.defaultProps
const displayName = components.SaveAddressesButton.displayName

type ChildrenProps = FunctionChildren<Omit<Props, 'children'>>

type Props = {
  children?: ChildrenProps
  label?: string | ReactNode
  onClick?: () => void
  addressId?: string
} & JSX.IntrinsicElements['button']

export function SaveAddressesButton(props: Props) {
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
    billing_address,
    shipToDifferentAddress,
    shipping_address,
    saveAddresses,
    billingAddressId,
    shippingAddressId,
    isBusiness,
  } = useContext(AddressContext)
  console.log('isBusiness', isBusiness)
  const { order } = useContext(OrderContext)
  const { addresses, isGuest, createCustomerAddress } =
    useContext(CustomerContext)
  const [forceDisable, setForceDisable] = useState(disabled)
  const customerEmail = !!(
    !!(isGuest === true || typeof isGuest === 'undefined') &&
    !order?.customer_email
  )
  const billingDisable = billingAddressController({
    billing_address,
    errors,
    billingAddressId,
    requiresBillingInfo: order?.requires_billing_info,
  })
  const shippingDisable = shippingAddressController({
    billingDisable,
    errors,
    shipToDifferentAddress,
    shipping_address,
    shippingAddressId,
  })
  const countryLockDisable = countryLockController({
    countryCodeLock: order?.shipping_country_code_lock,
    addresses,
    shipToDifferentAddress,
    billingAddressId,
    billing_address,
    shipping_address,
    shippingAddressId,
  })
  debugger
  const disable =
    disabled ||
    customerEmail ||
    billingDisable ||
    shippingDisable ||
    // customerDisable ||
    countryLockDisable
  const handleClick = () => {
    if (errors && Object.keys(errors).length === 0 && !disable) {
      setForceDisable(true)
      if (order) {
        saveAddresses(addressId)
      } else if (createCustomerAddress && billing_address) {
        const address = { ...billing_address }
        if (addressId) address['id'] = addressId
        void createCustomerAddress(address as TCustomerAddress)
      }
      setForceDisable(false)
      onClick && onClick()
    }
  }
  const parentProps = {
    ...p,
    label,
    resource,
    handleClick,
    disabled: disable,
  }
  return children ? (
    <Parent {...parentProps}>{children}</Parent>
  ) : (
    <button
      type="button"
      disabled={disable || forceDisable}
      onClick={handleClick}
      {...p}
    >
      {isFunction(label) ? label() : label}
    </button>
  )
}

SaveAddressesButton.propTypes = propTypes
SaveAddressesButton.defaultProps = defaultProps
SaveAddressesButton.displayName = displayName

export default SaveAddressesButton
