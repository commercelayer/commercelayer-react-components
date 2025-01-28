import BaseOrderPrice from '../utils/BaseOrderPrice'
import type { BaseAmountComponent } from '#typings'

import type { JSX } from "react";

export function ShippingAmount(props: BaseAmountComponent): JSX.Element {
  return <BaseOrderPrice base='amount' type='shipping' {...props} />
}

export default ShippingAmount
