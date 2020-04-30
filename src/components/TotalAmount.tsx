import React, { FunctionComponent } from 'react'
import BaseOrderPrice from './utils/BaseOrderPrice'
import { PropsType } from '../utils/PropsType'
import components from '../config/components'

const propTypes = components.TotalAmount.propTypes
const defaultProps = components.TotalAmount.defaultProps
const displayName = components.TotalAmount.displayName

export type TotalProps = PropsType<typeof propTypes> &
  JSX.IntrinsicElements['span']

const TotalAmount: FunctionComponent<TotalProps> = (props) => {
  return <BaseOrderPrice base="totalAmount" type="withTaxes" {...props} />
}

TotalAmount.propTypes = propTypes
TotalAmount.defaultProps = defaultProps
TotalAmount.displayName = displayName

export default TotalAmount
