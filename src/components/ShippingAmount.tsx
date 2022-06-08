import { FunctionComponent } from 'react'
import BaseOrderPrice from './utils/BaseOrderPrice'
import components from '#config/components'
import { BaseAmountComponent } from '#typings'

const propTypes = components.ShippingAmount.propTypes
const displayName = components.ShippingAmount.displayName

const ShippingAmount: FunctionComponent<BaseAmountComponent> = (props) => {
  return <BaseOrderPrice base="amount" type="shipping" {...props} />
}

ShippingAmount.propTypes = propTypes
ShippingAmount.displayName = displayName

export default ShippingAmount
