import React, { FunctionComponent } from 'react'
import { GeneralComponent } from '../@types/index'
import GeneralOrderPrice from './utils/GeneralOrderPrice'

export interface SubTotalProps extends GeneralComponent {
  format?: 'formatted' | 'cents' | 'float'
  children?: FunctionComponent
}

const SubTotal: FunctionComponent<SubTotalProps> = props => {
  return <GeneralOrderPrice base="amount" type="subtotal" {...props} />
}

export default SubTotal
