import React, { FunctionComponent } from 'react'
import GeneralOrderPrice from './utils/GeneralOrderPrice'

export interface TotalProps {
  format?: 'formatted' | 'cents' | 'float'
  children?: FunctionComponent
}

const Total: FunctionComponent<TotalProps> = props => {
  return <GeneralOrderPrice base="totalAmount" type="withTaxes" {...props} />
}

export default Total
