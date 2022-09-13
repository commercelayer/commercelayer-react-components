import BaseOrderPrice from '../utils/BaseOrderPrice'

import { BaseAmountComponent } from '#typings'

export function DiscountAmount(props: BaseAmountComponent) {
  return <BaseOrderPrice base="amount" type="discount" {...props} />
}

export default DiscountAmount
