import React, { FunctionComponent } from 'react'
import BaseOrderPrice from './utils/BaseOrderPrice'
import { PropsType } from '../utils/PropsType'
import components from '../config/components'

const propTypes = components.Shipping.propTypes
const displayName = components.Shipping.displayName

export type ShippingProps = PropsType<typeof propTypes> &
  JSX.IntrinsicElements['span']

const Shipping: FunctionComponent<ShippingProps> = (props) => {
  return <BaseOrderPrice base="amount" type="shipping" {...props} />
}

Shipping.propTypes = propTypes
Shipping.displayName = displayName

export default Shipping
