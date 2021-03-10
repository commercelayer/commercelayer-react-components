import React, { FunctionComponent, useContext } from 'react'
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

const propTypes = components.SaveAddressesButton.propTypes
const defaultProps = components.SaveAddressesButton.defaultProps
const displayName = components.SaveAddressesButton.displayName

type SaveAddressesButtonChildrenProps = FunctionChildren<
  Omit<SaveAddressesButtonProps, 'children'>
>

type SaveAddressesButtonProps = {
  children?: SaveAddressesButtonChildrenProps
  label?: string
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
  const { addresses } = useContext(CustomerContext)
  const billingDisable = billingAddressController({
    billingAddress,
    errors,
    billingAddressId,
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
  const disable =
    disabled || billingDisable || shippingDisable || countryLockDisable
  const handleClick = async () => {
    if (isEmpty(errors) && !disable) {
      await saveAddresses()
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
    <button type="button" disabled={disable} onClick={handleClick} {...p}>
      {label}
    </button>
  )
}

SaveAddressesButton.propTypes = propTypes
SaveAddressesButton.defaultProps = defaultProps
SaveAddressesButton.displayName = displayName

export default SaveAddressesButton
