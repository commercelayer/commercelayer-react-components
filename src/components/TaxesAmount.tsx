import React, { FunctionComponent } from 'react'
import BaseOrderPrice from './utils/BaseOrderPrice'
import components from '../config/components'
import { BaseAmountComponent } from '../typings'

const propTypes = components.TaxesAmount.propTypes
const defaultProps = components.TaxesAmount.defaultProps
const displayName = components.TaxesAmount.displayName

const TaxesAmount: FunctionComponent<BaseAmountComponent> = (props) => {
  return <BaseOrderPrice base="amount" type="totalTax" {...props} />
}

TaxesAmount.propTypes = propTypes
TaxesAmount.defaultProps = defaultProps
TaxesAmount.displayName = displayName

export default TaxesAmount
