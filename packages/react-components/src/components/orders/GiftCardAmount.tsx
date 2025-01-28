import BaseOrderPrice from '../utils/BaseOrderPrice'
import type { BaseAmountComponent } from '#typings'

import type { JSX } from "react";

export function GiftCardAmount(props: BaseAmountComponent): JSX.Element {
  return <BaseOrderPrice base='amount' type='gift_card' {...props} />
}

export default GiftCardAmount
