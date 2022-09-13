import BaseOrderPrice from '../utils/BaseOrderPrice'

import { BaseAmountComponent } from '#typings'

export function TotalAmount(props: BaseAmountComponent) {
  return <BaseOrderPrice base="total_amount" type="with_taxes" {...props} />
}

export default TotalAmount
