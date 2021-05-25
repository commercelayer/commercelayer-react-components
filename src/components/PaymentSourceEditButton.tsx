import PaymentSourceContext from '#context/PaymentSourceContext'
import React, { FunctionComponent, ReactNode, useContext } from 'react'
import Parent from './utils/Parent'
import { FunctionChildren } from '#typings'
import components from '#config/components'

const displayName = components.PaymentSourceEditButton.displayName
const propTypes = components.PaymentSourceEditButton.propTypes

type CustomComponent = FunctionChildren<Omit<Props, 'children'>>

type Props = {
  children?: CustomComponent
  label?: string | ReactNode
} & Omit<JSX.IntrinsicElements['button'], 'onClick'>
const PaymentSourceEditButton: FunctionComponent<Props> = ({
  children,
  label = 'Edit',
  ...props
}) => {
  const { showCard, handleEditClick, readonly } = useContext(
    PaymentSourceContext
  )
  const parentProps = {
    showCard,
    label,
    handleEditClick,
    ...props,
  }
  return children ? (
    <Parent {...parentProps}>{children}</Parent>
  ) : !readonly ? (
    <button {...props} onClick={handleEditClick}>
      {label}
    </button>
  ) : null
}

PaymentSourceEditButton.propTypes = propTypes
PaymentSourceEditButton.displayName = displayName

export default PaymentSourceEditButton
