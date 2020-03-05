import React, { FunctionComponent } from 'react'
import BaseOrderPrice, { BOCProps } from './utils/BaseOrderPrice'
import { BaseOrderComponentProps } from './utils/BaseOrderPrice'

const DProps = BOCProps

export type DiscountProps = BaseOrderComponentProps

const Discount: FunctionComponent<DiscountProps> = props => {
  return <BaseOrderPrice base="amount" type="discount" {...props} />
}

Discount.propTypes = DProps

export default Discount
