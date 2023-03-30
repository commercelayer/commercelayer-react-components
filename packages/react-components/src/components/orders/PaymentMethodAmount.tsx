import BaseOrderPrice from '#components/utils/BaseOrderPrice'
import { type BaseAmountComponent } from '#typings'

export function PaymentMethodAmount(props: BaseAmountComponent): JSX.Element {
  return <BaseOrderPrice base='amount' type='payment_method' {...props} />
}

export default PaymentMethodAmount
