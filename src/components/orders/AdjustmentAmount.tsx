import { FunctionComponent } from 'react'
import BaseOrderPrice from '../utils/BaseOrderPrice'
import { BaseAmountComponent } from '#typings'

const AdjustmentAmount: FunctionComponent<BaseAmountComponent> = (props) => {
  return <BaseOrderPrice base="amount" type="adjustment" {...props} />
}

export default AdjustmentAmount
