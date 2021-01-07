import React, { FunctionComponent, useContext } from 'react'
import Parent from './utils/Parent'
import components from '@config/components'
import { FunctionChildren } from '@typings/index'
import _ from 'lodash'
import CustomerContext from '@context/CustomerContext'

const propTypes = components.SaveCustomerButton.propTypes
const defaultProps = components.SaveCustomerButton.defaultProps
const displayName = components.SaveCustomerButton.displayName

type SaveAddressesButtonChildrenProps = FunctionChildren<
  Omit<SaveCustomerButtonProps, 'children'>
>

type SaveCustomerButtonProps = {
  children?: SaveAddressesButtonChildrenProps
  label?: string
  onClick?: () => void
} & JSX.IntrinsicElements['button']

const SaveCustomerButton: FunctionComponent<SaveCustomerButtonProps> = (
  props
) => {
  const { children, label = 'Save', resource, disabled, onClick, ...p } = props
  const { errors, saveCustomerUser, customerEmail, saveOnBlur } = useContext(
    CustomerContext
  )
  const disable =
    disabled || saveOnBlur || !_.isEmpty(errors) || _.isEmpty(customerEmail)
  const handleClick = async () => {
    if (_.isEmpty(errors) && !disable && !saveOnBlur) {
      await saveCustomerUser(customerEmail as string)
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

SaveCustomerButton.propTypes = propTypes
SaveCustomerButton.defaultProps = defaultProps
SaveCustomerButton.displayName = displayName

export default SaveCustomerButton
