import React, { FunctionComponent, useContext } from 'react'
import OrderContext from '../context/OrderContext'
import components from '../config/components'
import { InferProps } from 'prop-types'
import Parent from './utils/Parent'

const propTypes = components.Checkout.props
const defaultProps = components.Checkout.defaultProps
const displayName = components.Checkout.displayName

export type CheckoutProps = InferProps<typeof propTypes> &
  JSX.IntrinsicElements['a']

const Checkout: FunctionComponent<CheckoutProps> = props => {
  const { label, children, ...p } = props
  const { order } = useContext(OrderContext)
  const parentProps = {
    checkoutUrl: order?.checkoutUrl,
    label,
    ...p
  }
  return children ? (
    <Parent {...parentProps}>{children}</Parent>
  ) : (
    <a
      style={props.style}
      className={props.className}
      href={order?.checkoutUrl}
    >
      {props.label}
    </a>
  )
}

Checkout.propTypes = propTypes
Checkout.defaultProps = defaultProps
Checkout.displayName = displayName

export default Checkout
