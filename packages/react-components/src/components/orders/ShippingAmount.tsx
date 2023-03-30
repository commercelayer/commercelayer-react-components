import BaseOrderPrice from '../utils/BaseOrderPrice'
import { type BaseAmountComponent } from '#typings'

export function ShippingAmount(props: BaseAmountComponent): JSX.Element {
  return <BaseOrderPrice base='amount' type='shipping' {...props} />
}

export default ShippingAmount
