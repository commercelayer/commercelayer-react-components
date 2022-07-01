import BaseOrderPrice from '../utils/BaseOrderPrice'
import components from '#config/components'
import { BaseAmountComponent } from '#typings'

const propTypes = components.AdjustmentAmount.propTypes
const defaultProps = components.AdjustmentAmount.defaultProps
const displayName = components.AdjustmentAmount.displayName

export function AdjustmentAmount(props: BaseAmountComponent) {
  return <BaseOrderPrice base="amount" type="adjustment" {...props} />
}

AdjustmentAmount.propTypes = propTypes
AdjustmentAmount.defaultProps = defaultProps
AdjustmentAmount.displayName = displayName

export default AdjustmentAmount
