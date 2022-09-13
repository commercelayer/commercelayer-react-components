import BaseOrderPrice from '../utils/BaseOrderPrice'
import { BaseAmountComponent } from '#typings'

export function ShippingAmount(props: BaseAmountComponent) {
  return <BaseOrderPrice base="amount" type="shipping" {...props} />
}

export default ShippingAmount
