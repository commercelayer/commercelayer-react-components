import React, { FunctionComponent } from 'react'
import { BaseComponent } from '../@types/index'
import BaseOrderPrice from './utils/BaseOrderPrice'

export interface TaxAmountProps extends BaseComponent {
  format?: 'formatted' | 'cents' | 'float'
  children?: FunctionComponent
}

const Taxes: FunctionComponent<TaxAmountProps> = props => {
  return <BaseOrderPrice base="amount" type="totalTax" {...props} />
}

export default Taxes
