import React, { FunctionComponent } from 'react'
import BaseOrderPrice from './utils/BaseOrderPrice'
import components from '../config/components'
import { BaseAmountComponent } from '../@types'

const propTypes = components.DiscountAmount.propTypes
const defaultProps = components.DiscountAmount.defaultProps
const displayName = components.DiscountAmount.displayName

const DiscountAmount: FunctionComponent<BaseAmountComponent> = (props) => {
  return <BaseOrderPrice base="amount" type="discount" {...props} />
}

DiscountAmount.propTypes = propTypes
DiscountAmount.defaultProps = defaultProps
DiscountAmount.displayName = displayName

export default DiscountAmount
