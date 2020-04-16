import React, { FunctionComponent } from 'react'
import BaseOrderPrice from './utils/BaseOrderPrice'
import { PropsType } from '../utils/PropsType'
import components from '../config/components'

const propTypes = components.Total.propTypes
const defaultProps = components.Total.defaultProps
const displayName = components.Total.displayName

export type TotalProps = PropsType<typeof propTypes> &
  JSX.IntrinsicElements['span']

const Total: FunctionComponent<TotalProps> = (props) => {
  return <BaseOrderPrice base="totalAmount" type="withTaxes" {...props} />
}

Total.propTypes = propTypes
Total.defaultProps = defaultProps
Total.displayName = displayName

export default Total
