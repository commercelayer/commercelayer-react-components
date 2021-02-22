import React, { useContext, FunctionComponent, ReactNode } from 'react'
import PaymentMethodChildrenContext from '#context/PaymentMethodChildrenContext'
import Parent from './utils/Parent'
import components from '#config/components'

const propTypes = components.PaymentMethodName.propTypes
const displayName = components.PaymentMethodName.displayName

type PaymentMethodNameChildrenProps = Omit<PaymentMethodNameProps, 'children'>

type PaymentMethodNameProps = {
  children?: (props: PaymentMethodNameChildrenProps) => ReactNode
} & JSX.IntrinsicElements['p']

const PaymentMethodName: FunctionComponent<PaymentMethodNameProps> = (
  props
) => {
  const { payment } = useContext(PaymentMethodChildrenContext)
  const labelName = payment?.['name']
  const parentProps = {
    ...props,
  }
  return props.children ? (
    <Parent {...parentProps}>{props.children}</Parent>
  ) : (
    <p {...props}>{labelName}</p>
  )
}

PaymentMethodName.propTypes = propTypes
PaymentMethodName.displayName = displayName

export default PaymentMethodName
