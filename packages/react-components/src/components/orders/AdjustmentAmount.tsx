import BaseOrderPrice from '../utils/BaseOrderPrice'
import { type BaseAmountComponent } from '#typings'

export function AdjustmentAmount(props: BaseAmountComponent): JSX.Element {
  return <BaseOrderPrice base='amount' type='adjustment' {...props} />
}

export default AdjustmentAmount
