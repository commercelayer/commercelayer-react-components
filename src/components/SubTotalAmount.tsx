import React, { FunctionComponent } from 'react'
import BaseOrderPrice from './utils/BaseOrderPrice'
import components from '#config/components'
import { BaseAmountComponent } from '#typings'

const propTypes = components.SubTotalAmount.propTypes
const defaultProps = components.SubTotalAmount.defaultProps
const displayName = components.SubTotalAmount.displayName

const SubTotalAmount: FunctionComponent<BaseAmountComponent> = (props) => {
  return <BaseOrderPrice base="amount" type="subtotal" {...props} />
}

SubTotalAmount.propTypes = propTypes
SubTotalAmount.defaultProps = defaultProps
SubTotalAmount.displayName = displayName

export default SubTotalAmount
