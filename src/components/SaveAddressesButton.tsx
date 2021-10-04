import React, {
  FunctionComponent,
  ReactNode,
  useContext,
  useState,
} from 'react'
import Parent from './utils/Parent'
import components from '#config/components'
import { FunctionChildren } from '#typings/index'
import AddressContext from '#context/AddressContext'
import { isEmpty } from 'lodash'
import {
  billingAddressController,
  shippingAddressController,
  countryLockController,
} from '#utils/addressesManager'
import OrderContext from '#context/OrderContext'
import CustomerContext from '#context/CustomerContext'
import isFunction from 'lodash/isFunction'

const propTypes = components.SaveAddressesButton.propTypes
const defaultProps = components.SaveAddressesButton.defaultProps
const displayName = components.SaveAddressesButton.displayName

type SaveAddressesButtonChildrenProps = FunctionChildren<
  Omit<SaveAddressesButtonProps, 'children'>
>

type SaveAddressesButtonProps = {
  children?: SaveAddressesButtonChildrenProps
  label?: string | ReactNode
  onClick?: () => void
} & JSX.IntrinsicElements['button']

const SaveAddressesButton: FunctionComponent<SaveAddressesButtonProps> = (
  props
) => {
  const {
    children,
    label = 'Continue to delivery',
    resource,
    disabled = false,
    onClick,
    ...p
  } = props
  const {
    errors,
    billingAddress,
    shipToDifferentAddress,
    shippingAddress,
    saveAddresses,
    billingAddressId,
    shippingAddressId,
  } = useContext(AddressContext)
  const { order } = useContext(OrderContext)
  const { addresses, isGuest } = useContext(CustomerContext)
  const [forceDisable, setForceDisable] = useState(disabled)
  const billingDisable = billingAddressController({
    billingAddress,
    errors,
    billingAddressId,
    // @ts-ignore
    requiresBillingInfo: order?.requiresBillingInfo,
  })
  const shippingDisable = shippingAddressController({
    billingDisable,
    errors,
    shipToDifferentAddress,
    shippingAddress,
    shippingAddressId,
  })
  const countryLockDisable = countryLockController({
    countryCodeLock: order?.shippingCountryCodeLock,
    addresses,
    shipToDifferentAddress,
    billingAddressId,
    billingAddress,
    shippingAddress,
    shippingAddressId,
  })
  const customerEmail = !!(
    !!(isGuest === true || typeof isGuest === 'undefined') &&
    !order?.customerEmail
  )
  const disable =
    disabled ||
    customerEmail ||
    billingDisable ||
    shippingDisable ||
    countryLockDisable
  const handleClick = async () => {
    if (isEmpty(errors) && !disable) {
      setForceDisable(true)
      await saveAddresses()
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
