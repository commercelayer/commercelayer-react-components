import React, { FunctionComponent } from 'react'
import BaseOrderPrice from './utils/BaseOrderPrice'
import { PropsType } from '../utils/PropsType'
import components from '../config/components'

const propTypes = components.SubTotalAmount.propTypes
const defaultProps = components.SubTotalAmount.defaultProps
const displayName = components.SubTotalAmount.displayName

export type SubTotalProps = PropsType<typeof propTypes> &
  JSX.IntrinsicElements['span']

const SubTotalAmount: FunctionComponent<SubTotalProps> = (props) => {
  return <BaseOrderPrice base="amount" type="subtotal" {...props} />
}

SubTotalAmount.propTypes = propTypes
SubTotalAmount.defaultProps = defaultProps
SubTotalAmount.displayName = displayName

export default SubTotalAmount
