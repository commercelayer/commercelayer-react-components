import React, { useContext, FunctionComponent } from 'react'
import LineItemChildrenContext from '../context/LineItemChildrenContext'
import Parent from './utils/Parent'
import components from '../config/components'
import { PropsType } from '../utils/PropsType'

const propTypes = components.LineItemName.propTypes
const displayName = components.LineItemName.displayName

export type LineItemNameProps = PropsType<typeof propTypes> &
  JSX.IntrinsicElements['p']

const LineItemName: FunctionComponent<LineItemNameProps> = (props) => {
  const { label } = props
  const { lineItem } = useContext(LineItemChildrenContext)
  const labelName = label || lineItem['name']
  const parentProps = {
    label: labelName,
    ...props,
  }
  return props.children ? (
    <Parent {...parentProps}>{props.children}</Parent>
  ) : (
    <p {...props}>{labelName}</p>
  )
}

LineItemName.propTypes = propTypes
LineItemName.displayName = displayName

export default LineItemName
