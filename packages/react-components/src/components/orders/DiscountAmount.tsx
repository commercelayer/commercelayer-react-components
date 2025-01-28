import BaseOrderPrice from '../utils/BaseOrderPrice'
import type { BaseAmountComponent } from '#typings'

import type { JSX } from "react";

export function DiscountAmount(props: BaseAmountComponent): JSX.Element {
  return <BaseOrderPrice base='amount' type='discount' {...props} />
}

export default DiscountAmount
