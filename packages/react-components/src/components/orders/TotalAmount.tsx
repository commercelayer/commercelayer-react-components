import BaseOrderPrice from '../utils/BaseOrderPrice'
import { type BaseAmountComponent } from '#typings'

import type { JSX } from "react";

export function TotalAmount(props: BaseAmountComponent): JSX.Element {
  return <BaseOrderPrice base='total_amount' type='with_taxes' {...props} />
}

export default TotalAmount
