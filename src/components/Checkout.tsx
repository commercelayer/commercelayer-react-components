import React, { FunctionComponent, useContext } from 'react'
import { BaseComponent } from '../@types/index'
import OrderContext from '../context/OrderContext'
import PropTypes, { InferProps } from 'prop-types'

const CProps = {
  label: PropTypes.string
}

export type CheckoutProps = InferProps<typeof CProps> & BaseComponent

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

Checkout.propTypes = CProps

export default Checkout
