import React, { FunctionComponent } from 'react'
import BaseOrderPrice from './utils/BaseOrderPrice'
import components from '@config/components'
import { BaseAmountComponent } from '@typings'

const propTypes = components.TotalAmount.propTypes
const defaultProps = components.TotalAmount.defaultProps
const displayName = components.TotalAmount.displayName

const TotalAmount: FunctionComponent<BaseAmountComponent> = (props) => {
  return <BaseOrderPrice base="totalAmount" type="withTaxes" {...props} />
}

TotalAmount.propTypes = propTypes
TotalAmount.defaultProps = defaultProps
TotalAmount.displayName = displayName

export default TotalAmount
