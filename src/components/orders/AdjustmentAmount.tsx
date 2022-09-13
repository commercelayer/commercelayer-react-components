import BaseOrderPrice from '#components-utils/BaseOrderPrice'
import { BaseAmountComponent } from '#typings'

export  function AdjustmentAmount(props: BaseAmountComponent): JSX.Element {
  return <BaseOrderPrice base="amount" type="adjustment" {...props} />
}

export default AdjustmentAmount
