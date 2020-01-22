import React, { FunctionComponent, CSSProperties } from 'react'
import { OrderCollection } from '@commercelayer/js-sdk'
import { GeneralComponent } from '../@types/index'

export interface CheckoutProps extends GeneralComponent {
  order?: OrderCollection
  label?: string
}

const Checkout: FunctionComponent<CheckoutProps> = props => {
  return props.order ? (
    <a className={props.className} href={props.order.checkoutUrl}>
      {props.label}
    </a>
  ) : null
}

Checkout.defaultProps = {
  label: 'checkout'
}

export default Checkout
