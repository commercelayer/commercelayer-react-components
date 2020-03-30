import React, { FunctionComponent } from 'react'
import BaseOrderPrice from './utils/BaseOrderPrice'
import components from '../config/components'
import { InferProps } from 'prop-types'

const propTypes = components.Discount.props
const defaultProps = components.Discount.defaultProps
const displayName = components.Discount.displayName

export type DiscountProps = InferProps<typeof propTypes>

const Discount: FunctionComponent<DiscountProps> = props => {
  return <BaseOrderPrice base="amount" type="discount" {...props} />
}

Discount.propTypes = propTypes
Discount.defaultProps = defaultProps
Discount.displayName = displayName

export default Discount
