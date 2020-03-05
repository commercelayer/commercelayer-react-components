import React, { FunctionComponent } from 'react'
import BaseOrderPrice from './utils/BaseOrderPrice'
import { BOCProps, BaseOrderComponentProps } from './utils/BaseOrderPrice'

export type ShippingProps = BaseOrderComponentProps

const Shipping: FunctionComponent<ShippingProps> = props => {
  return <BaseOrderPrice base="amount" type="shipping" {...props} />
}

Shipping.propTypes = BOCProps

export default Shipping
