import React, { FunctionComponent, useContext } from 'react'
import LineItemChildrenContext from '../context/LineItemChildrenContext'
import LineItemContext from '../context/LineItemContext'
import Parent from './utils/Parent'
import { PropsType } from '../utils/PropsType'
import components from '../config/components'

const propTypes = components.LineItemRemove.propTypes
const defaultProps = components.LineItemRemove.defaultProps
const displayName = components.LineItemRemove.displayName

export type LineItemRemoveProps = PropsType<typeof propTypes> &
  JSX.IntrinsicElements['a']

const LineItemRemove: FunctionComponent<LineItemRemoveProps> = (props) => {
  const { lineItem } = useContext(LineItemChildrenContext)
  const { deleteLineItem } = useContext(LineItemContext)
  const handleRemove = (e): void => {
    e.preventDefault()
    deleteLineItem && deleteLineItem(lineItem['id'])
  }
  const parentProps = {
    handleRemove,
    ...props,
  }
  return props.children ? (
    <Parent {...parentProps}>{props.children}</Parent>
  ) : (
    <a {...props} href="#" onClick={handleRemove}>
      {props.label}
    </a>
  )
}

LineItemRemove.propTypes = propTypes
LineItemRemove.defaultProps = defaultProps
LineItemRemove.displayName = displayName

export default LineItemRemove
