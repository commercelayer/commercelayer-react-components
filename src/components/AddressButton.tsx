import React, { FunctionComponent, useContext } from 'react'
import Parent from './utils/Parent'
import components from '../config/components'
import { FunctionChildren } from '../typings/index'
import AddressContext from '../context/AddressContext'
import _ from 'lodash'
import { fieldsExist } from '../utils/validateFormFields'
import { addressFields } from '../reducers/AddressReducer'

const propTypes = components.AddressButton.propTypes
const defaultProps = components.AddressButton.defaultProps
const displayName = components.AddressButton.displayName

type AddressButtonChildrenProps = FunctionChildren<
  Omit<AddressButtonProps, 'children'>
>

type AddressButtonProps = {
  children?: AddressButtonChildrenProps
  label?: string
  onClick?: () => void
} & JSX.IntrinsicElements['button']

const AddressButton: FunctionComponent<AddressButtonProps> = (props) => {
  const {
    children,
    label = 'Continue to delivery',
    resource,
    disabled,
    onClick,
    ...p
  } = props
  const {
    errors,
    billingAddress,
    shipToDifferentAddress,
    shippingAddress,
    saveAddresses,
  } = useContext(AddressContext)
  let disable =
    disabled ||
    !_.isEmpty(errors) ||
    _.isEmpty(billingAddress) ||
    (shipToDifferentAddress && _.isEmpty(shippingAddress))
  if (_.isEmpty(errors) && !_.isEmpty(billingAddress)) {
    disable = billingAddress && fieldsExist(billingAddress)
  }
  if (
    _.isEmpty(errors) &&
    shipToDifferentAddress
    // !_.isEmpty(shippingAddress)
  ) {
    disable =
      shippingAddress &&
      fieldsExist(shippingAddress, _.without(addressFields, 'customer_email'))
  }
  const handleClick = () => {
    if (_.isEmpty(errors) && !disable) {
      saveAddresses()
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

AddressButton.propTypes = propTypes
AddressButton.defaultProps = defaultProps
AddressButton.displayName = displayName

export default AddressButton
