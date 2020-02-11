import React, { FunctionComponent } from 'react'
import BaseOrderPrice from './utils/BaseOrderPrice'
import { BaseComponent } from '../@types/index'

export interface TotalProps extends BaseComponent {
  format?: 'formatted' | 'cents' | 'float'
  children?: FunctionComponent
}

const Total: FunctionComponent<TotalProps> = props => {
  return <BaseOrderPrice base="totalAmount" type="withTaxes" {...props} />
}

export default Total
