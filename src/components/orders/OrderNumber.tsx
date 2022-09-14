import components from '#config/components'
import BaseField, { BaseFieldProps } from '../utils/BaseField'

const propTypes = components.OrderNumber.propTypes
const displayName = components.OrderNumber.displayName

type Props = Omit<BaseFieldProps, 'attribute'>

export function OrderNumber(props: Props) {
  return <BaseField attribute="number" {...props} />
}

OrderNumber.propTypes = propTypes
OrderNumber.displayName = displayName

export default OrderNumber
