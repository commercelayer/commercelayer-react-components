import BaseOrderPrice from '../utils/BaseOrderPrice'
import { BaseAmountComponent } from '#typings'

export function DiscountAmount(props: BaseAmountComponent): JSX.Element {
  return <BaseOrderPrice base='amount' type='discount' {...props} />
}

export default DiscountAmount
