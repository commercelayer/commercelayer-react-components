import React, { FunctionComponent } from 'react'
import { GeneralComponent } from '../@types/index'
import GeneralOrderPrice from './utils/GeneralOrderPrice'

export interface DiscountProps extends GeneralComponent {
  format?: 'formatted' | 'cents' | 'float'
  children?: FunctionComponent
}

const Discount: FunctionComponent<DiscountProps> = props => {
  return <GeneralOrderPrice base="amount" type="discount" {...props} />
}

export default Discount
