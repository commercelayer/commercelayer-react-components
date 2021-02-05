import React, { FunctionComponent, useContext } from 'react'
import Parent from './utils/Parent'
import components from '#config/components'
import { FunctionChildren } from '#typings/index'
import AddressContext from '#context/AddressContext'
import _ from 'lodash'
import { fieldsExist } from '#utils/validateFormFields'

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
  let billingDisable = !_.isEmpty(errors) || _.isEmpty(billingAddress)
  if (_.isEmpty(errors) && !_.isEmpty(billingAddress)) {
    billingDisable = !!(billingAddress && fieldsExist(billingAddress))
  }
  if (
    billingDisable &&
    !_.isEmpty(billingAddressId) &&
    _.isEmpty(billingAddress)
  ) {
    billingDisable = false
  }
  let shippingDisable = !!(!billingDisable && shipToDifferentAddress)
  if (shippingDisable && _.isEmpty(errors) && !_.isEmpty(shippingAddress)) {
    shippingDisable = !!(shippingAddress && fieldsExist(shippingAddress))
  }
  if (
    shippingDisable &&
    !_.isEmpty(shippingAddressId) &&
    _.isEmpty(shippingAddress)
  ) {
    shippingDisable = false
  }
  const disable = disabled || billingDisable || shippingDisable
  const handleClick = async () => {
    if (_.isEmpty(errors) && !disable) {
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
