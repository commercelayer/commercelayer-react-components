import { ReactNode, useContext } from 'react'
import Parent from '#components/utils/Parent'
import { ChildrenFunction } from '#typings/index'
import isEmpty from 'lodash/isEmpty'
import CustomerContext from '#context/CustomerContext'

interface ChildrenProps extends Omit<Props, 'children'> {
  handleClick: () => void
}

interface Props extends Omit<JSX.IntrinsicElements['button'], 'children'> {
  children?: ChildrenFunction<ChildrenProps>
  label?: string | ReactNode
  onClick?: () => void
}

export function SaveCustomerButton(props: Props): JSX.Element {
  const { children, label = 'Save', resource, disabled, onClick, ...p } = props
  const { errors, saveCustomerUser, customerEmail } =
    useContext(CustomerContext)
  const disable = disabled || !isEmpty(errors) || isEmpty(customerEmail)
  const handleClick = async (): Promise<void> => {
    if (isEmpty(errors) && !disable) {
      saveCustomerUser && (await saveCustomerUser(customerEmail as string))
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
      disabled={disable}
      onClick={() => {
        void handleClick()
      }}
      {...p}
    >
      {label}
    </button>
  )
}

export default SaveCustomerButton
