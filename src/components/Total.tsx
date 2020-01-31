import React, { FunctionComponent } from 'react'
import GeneralOrderPrice from './utils/GeneralOrderPrice'
import { GeneralComponent } from '../@types/index'

export interface TotalProps extends GeneralComponent {
  format?: 'formatted' | 'cents' | 'float'
  children?: FunctionComponent
}

const Total: FunctionComponent<TotalProps> = props => {
  return <GeneralOrderPrice base="totalAmount" type="withTaxes" {...props} />
}

export default Total
