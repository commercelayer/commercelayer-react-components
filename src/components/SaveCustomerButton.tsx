import { ReactNode, useContext } from 'react'
import Parent from './utils/Parent'
import components from '#config/components'
import { FunctionChildren } from '#typings/index'
import { isEmpty } from 'lodash'
import CustomerContext from '#context/CustomerContext'

const propTypes = components.SaveCustomerButton.propTypes
const defaultProps = components.SaveCustomerButton.defaultProps
const displayName = components.SaveCustomerButton.displayName

type ParentProps = {
  handleClick: () => any
}

type ChildrenProps = FunctionChildren<Omit<Props & ParentProps, 'children'>>

type Props = {
  children?: ChildrenProps
  label?: string | ReactNode
  onClick?: () => void
} & JSX.IntrinsicElements['button']

export function SaveCustomerButton(props: Props) {
  const { children, label = 'Save', resource, disabled, onClick, ...p } = props
  const { errors, saveCustomerUser, customerEmail } =
    useContext(CustomerContext)
  const disable = disabled || !isEmpty(errors) || isEmpty(customerEmail)
  const handleClick = async () => {
    if (isEmpty(errors) && !disable) {
      saveCustomerUser && (await saveCustomerUser(customerEmail as string))
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
    <button type="button" disabled={disable} onClick={void handleClick} {...p}>
      {label}
    </button>
  )
}

SaveCustomerButton.propTypes = propTypes
SaveCustomerButton.defaultProps = defaultProps
SaveCustomerButton.displayName = displayName

export default SaveCustomerButton
