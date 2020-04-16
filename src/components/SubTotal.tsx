import React, { FunctionComponent } from 'react'
import BaseOrderPrice from './utils/BaseOrderPrice'
import { PropsType } from '../utils/PropsType'
import components from '../config/components'

const propTypes = components.SubTotal.propTypes
const defaultProps = components.SubTotal.defaultProps
const displayName = components.SubTotal.displayName

export type SubTotalProps = PropsType<typeof propTypes> &
  JSX.IntrinsicElements['span']

const SubTotal: FunctionComponent<SubTotalProps> = (props) => {
  return <BaseOrderPrice base="amount" type="subtotal" {...props} />
}

SubTotal.propTypes = propTypes
SubTotal.defaultProps = defaultProps
SubTotal.displayName = displayName

export default SubTotal
