import BaseOrderPrice from '../utils/BaseOrderPrice'
import components from '#config/components'
import { BaseAmountComponent } from '#typings'

const propTypes = components.TaxesAmount.propTypes
const defaultProps = components.TaxesAmount.defaultProps
const displayName = components.TaxesAmount.displayName

export function TaxesAmount(props: BaseAmountComponent) {
  return <BaseOrderPrice base="amount" type="total_tax" {...props} />
}

TaxesAmount.propTypes = propTypes
TaxesAmount.defaultProps = defaultProps
TaxesAmount.displayName = displayName

export default TaxesAmount