import BaseOrderPrice from '../utils/BaseOrderPrice'
import { type BaseAmountComponent } from '#typings'

export function TotalAmount(props: BaseAmountComponent): JSX.Element {
  return <BaseOrderPrice base='total_amount' type='with_taxes' {...props} />
}

export default TotalAmount
