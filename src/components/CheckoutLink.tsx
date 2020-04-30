import React, { FunctionComponent, useContext } from 'react'
import OrderContext from '../context/OrderContext'
import components from '../config/components'
import { InferProps } from 'prop-types'
import Parent from './utils/Parent'

const propTypes = components.CheckoutLink.propTypes
const defaultProps = components.CheckoutLink.defaultProps
const displayName = components.CheckoutLink.displayName

export type CheckoutLinkProps = InferProps<typeof propTypes> &
  JSX.IntrinsicElements['a']

const CheckoutLink: FunctionComponent<CheckoutLinkProps> = (props) => {
  const { label, children, ...p } = props
  const { order } = useContext(OrderContext)
  const parentProps = {
    checkoutUrl: order?.checkoutUrl,
    label,
    ...p,
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

CheckoutLink.propTypes = propTypes
CheckoutLink.defaultProps = defaultProps
CheckoutLink.displayName = displayName

export default CheckoutLink
