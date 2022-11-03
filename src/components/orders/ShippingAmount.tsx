import BaseOrderPrice from '../utils/BaseOrderPrice'
import { BaseAmountComponent } from '#typings'

export function ShippingAmount(props: BaseAmountComponent): JSX.Element {
  return <BaseOrderPrice base='amount' type='shipping' {...props} />
}

export default ShippingAmount
