import BaseOrderPrice from '../utils/BaseOrderPrice'
import type { BaseAmountComponent } from '#typings'

import type { JSX } from "react";

export function AdjustmentAmount(props: BaseAmountComponent): JSX.Element {
  return <BaseOrderPrice base='amount' type='adjustment' {...props} />
}

export default AdjustmentAmount
