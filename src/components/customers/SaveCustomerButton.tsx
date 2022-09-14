import { ReactNode, useContext } from 'react'
import Parent from '../utils/Parent'
import { FunctionChildren } from '#typings/index'
import { isEmpty } from 'lodash'
import CustomerContext from '#context/CustomerContext'

type ParentProps = {
  handleClick: () => void
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

export default SaveCustomerButton
