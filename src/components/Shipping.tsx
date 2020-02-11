import React, { FunctionComponent } from 'react'
import { BaseComponent } from '../@types/index'
import BaseOrderPrice from './utils/BaseOrderPrice'

export interface ShippingProps extends BaseComponent {
  format?: 'formatted' | 'cents' | 'float'
  children?: FunctionComponent
}

const Shipping: FunctionComponent<ShippingProps> = props => {
  return <BaseOrderPrice base="amount" type="shipping" {...props} />
}

export default Shipping
