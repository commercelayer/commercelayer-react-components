import BaseOrderPrice from '../utils/BaseOrderPrice'

import { BaseAmountComponent } from '#typings'

export function GiftCardAmount(props: BaseAmountComponent) {
  return <BaseOrderPrice base="amount" type="gift_card" {...props} />
}

export default GiftCardAmount
