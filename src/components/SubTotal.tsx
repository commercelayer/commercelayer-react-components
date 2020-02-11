import React, { FunctionComponent } from 'react'
import { BaseComponent } from '../@types/index'
import BaseOrderPrice from './utils/BaseOrderPrice'

export interface SubTotalProps extends BaseComponent {
  format?: 'formatted' | 'cents' | 'float'
  children?: FunctionComponent
}

const SubTotal: FunctionComponent<SubTotalProps> = props => {
  return <BaseOrderPrice base="amount" type="subtotal" {...props} />
}

export default SubTotal
