import React, { FunctionComponent, useContext } from 'react'
import OrderContext from '../context/OrderContext'
import components from '../config/components'
import Parent from './utils/Parent'
import { FunctionChildren } from '../typings/index'

const propTypes = components.CheckoutLink.propTypes
const defaultProps = components.CheckoutLink.defaultProps
const displayName = components.CheckoutLink.displayName

type CheckoutLinkChildrenProps = FunctionChildren<
  Omit<CheckoutLinkProps, 'children'> & {
    checkoutUrl: string
  }
>

type CheckoutLinkProps = {
  children?: CheckoutLinkChildrenProps
  label?: string
} & JSX.IntrinsicElements['a']

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
    <a href={order?.checkoutUrl} {...p}>
      {label}
    </a>
  )
}

CheckoutLink.propTypes = propTypes
CheckoutLink.defaultProps = defaultProps
CheckoutLink.displayName = displayName

export default CheckoutLink
