import BaseOrderPrice from '../utils/BaseOrderPrice'
import components from '#config/components'
import { BaseAmountComponent } from '#typings'

const propTypes = components.DiscountAmount.propTypes
const defaultProps = components.DiscountAmount.defaultProps
const displayName = components.DiscountAmount.displayName

export function DiscountAmount(props: BaseAmountComponent) {
  return <BaseOrderPrice base="amount" type="discount" {...props} />
}

DiscountAmount.propTypes = propTypes
DiscountAmount.defaultProps = defaultProps
DiscountAmount.displayName = displayName

export default DiscountAmount
