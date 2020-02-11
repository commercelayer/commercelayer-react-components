import React, { FunctionComponent, useContext } from 'react'
import { BaseComponent } from '../@types/index'
import OrderContext from '../context/OrderContext'

export interface CheckoutProps extends BaseComponent {
  label?: string
}

const Checkout: FunctionComponent<CheckoutProps> = props => {
  const { order } = useContext(OrderContext)
  return order ? (
    <a style={props.style} className={props.className} href={order.checkoutUrl}>
      {props.label}
    </a>
  ) : null
}

Checkout.defaultProps = {
  label: 'checkout'
}

export default Checkout
