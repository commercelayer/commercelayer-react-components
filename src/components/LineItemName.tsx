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
  const { lineItem } = useContext(LineItemChildrenContext)
  const parentProps = {
    name: lineItem['name'],
    ...props,
  }
  return props.children ? (
    <Parent {...parentProps}>{props.children}</Parent>
  ) : (
    <p {...props}>{lineItem['name']}</p>
  )
}

LineItemName.propTypes = propTypes
LineItemName.displayName = displayName

export default LineItemName
