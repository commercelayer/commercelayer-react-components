import React, { FunctionComponent } from 'react'
import BaseOrderPrice from './utils/BaseOrderPrice'
import { PropsType } from '../utils/PropsType'
import components from '../config/components'

const propTypes = components.TaxesAmount.propTypes
const defaultProps = components.TaxesAmount.defaultProps
const displayName = components.TaxesAmount.displayName

export type TaxAmountProps = PropsType<typeof propTypes> &
  JSX.IntrinsicElements['span']

const TaxesAmount: FunctionComponent<TaxAmountProps> = (props) => {
  return <BaseOrderPrice base="amount" type="totalTax" {...props} />
}

TaxesAmount.propTypes = propTypes
TaxesAmount.defaultProps = defaultProps
TaxesAmount.displayName = displayName

export default TaxesAmount
