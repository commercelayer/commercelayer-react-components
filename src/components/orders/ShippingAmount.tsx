import BaseOrderPrice from '../utils/BaseOrderPrice'
import components from '#config/components'
import { BaseAmountComponent } from '#typings'

const propTypes = components.ShippingAmount.propTypes
const displayName = components.ShippingAmount.displayName

export function ShippingAmount(props: BaseAmountComponent) {
  return <BaseOrderPrice base="amount" type="shipping" {...props} />
}

ShippingAmount.propTypes = propTypes
ShippingAmount.displayName = displayName

export default ShippingAmount
