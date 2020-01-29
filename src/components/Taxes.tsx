import React, { FunctionComponent } from 'react'
import { GeneralComponent } from '../@types/index'
import GeneralOrderPrice from './utils/GeneralOrderPrice'

export interface TaxAmountProps extends GeneralComponent {
  format?: 'formatted' | 'cents' | 'float'
  children?: FunctionComponent
}

const Taxes: FunctionComponent<TaxAmountProps> = props => {
  return <GeneralOrderPrice base="amount" type="totalTax" {...props} />
}

export default Taxes
