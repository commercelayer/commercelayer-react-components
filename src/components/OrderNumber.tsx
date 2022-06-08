import { FunctionComponent } from 'react'
import components from '#config/components'
import BaseField, { BaseFieldProps } from './utils/BaseField'

const propTypes = components.OrderNumber.propTypes
const displayName = components.OrderNumber.displayName

export type OrderNumberProps = Omit<BaseFieldProps, 'attribute'>

const OrderNumber: FunctionComponent<OrderNumberProps> = (props) => {
  return <BaseField attribute="number" {...props} />
}

OrderNumber.propTypes = propTypes
OrderNumber.displayName = displayName

export default OrderNumber
