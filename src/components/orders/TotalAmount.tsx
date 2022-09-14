import BaseOrderPrice from '../utils/BaseOrderPrice'
import components from '#config/components'
import { BaseAmountComponent } from '#typings'

const propTypes = components.TotalAmount.propTypes
const defaultProps = components.TotalAmount.defaultProps
const displayName = components.TotalAmount.displayName

export function TotalAmount(props: BaseAmountComponent) {
  return <BaseOrderPrice base="total_amount" type="with_taxes" {...props} />
}

TotalAmount.propTypes = propTypes
TotalAmount.defaultProps = defaultProps
TotalAmount.displayName = displayName

export default TotalAmount
