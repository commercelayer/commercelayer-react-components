import BaseOrderPrice from '../utils/BaseOrderPrice'
import { BaseAmountComponent } from '#typings'

export function SubTotalAmount(props: BaseAmountComponent): JSX.Element {
  return <BaseOrderPrice base='amount' type='subtotal' {...props} />
}

export default SubTotalAmount
