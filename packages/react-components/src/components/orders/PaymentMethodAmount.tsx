import BaseOrderPrice from '#components/utils/BaseOrderPrice'
import type { BaseAmountComponent } from '#typings'

import type { JSX } from "react";

export function PaymentMethodAmount(props: BaseAmountComponent): JSX.Element {
  return <BaseOrderPrice base='amount' type='payment_method' {...props} />
}

export default PaymentMethodAmount
