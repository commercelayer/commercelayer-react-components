import React, { FunctionComponent } from 'react'
import { BaseComponent } from '../@types/index'
import BaseOrderPrice from './utils/BaseOrderPrice'

export interface DiscountProps extends BaseComponent {
  format?: 'formatted' | 'cents' | 'float'
  children?: FunctionComponent
}

const Discount: FunctionComponent<DiscountProps> = props => {
  return <BaseOrderPrice base="amount" type="discount" {...props} />
}

export default Discount
