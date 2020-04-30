import React, { FunctionComponent } from 'react'
import BaseOrderPrice from './utils/BaseOrderPrice'
import { PropsType } from '../utils/PropsType'
import components from '../config/components'

const propTypes = components.ShippingAmount.propTypes
const displayName = components.ShippingAmount.displayName

export type ShippingProps = PropsType<typeof propTypes> &
  JSX.IntrinsicElements['span']

const ShippingAmount: FunctionComponent<ShippingProps> = (props) => {
  return <BaseOrderPrice base="amount" type="shipping" {...props} />
}

ShippingAmount.propTypes = propTypes
ShippingAmount.displayName = displayName

export default ShippingAmount
