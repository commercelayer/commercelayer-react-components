import React, { FunctionComponent } from 'react'
import BaseOrderPrice from './utils/BaseOrderPrice'
import components from '../config/components'
import { InferProps } from 'prop-types'

const propTypes = components.DiscountAmount.propTypes
const displayName = components.DiscountAmount.displayName

export type DiscountAmountProps = InferProps<typeof propTypes> &
  JSX.IntrinsicElements['span']

const DiscountAmount: FunctionComponent<DiscountAmountProps> = (props) => {
  return <BaseOrderPrice base="amount" type="discount" {...props} />
}

DiscountAmount.propTypes = propTypes
DiscountAmount.displayName = displayName

export default DiscountAmount
