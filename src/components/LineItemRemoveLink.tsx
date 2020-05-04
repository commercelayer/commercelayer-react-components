import React, { FunctionComponent, useContext } from 'react'
import LineItemChildrenContext from '../context/LineItemChildrenContext'
import LineItemContext from '../context/LineItemContext'
import Parent from './utils/Parent'
import { PropsType } from '../utils/PropsType'
import components from '../config/components'

const propTypes = components.LineItemRemoveLink.propTypes
const defaultProps = components.LineItemRemoveLink.defaultProps
const displayName = components.LineItemRemoveLink.displayName

export type LineItemRemoveProps = PropsType<typeof propTypes> &
  JSX.IntrinsicElements['a']

const LineItemRemoveLink: FunctionComponent<LineItemRemoveProps> = (props) => {
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

LineItemRemoveLink.propTypes = propTypes
LineItemRemoveLink.defaultProps = defaultProps
LineItemRemoveLink.displayName = displayName

export default LineItemRemoveLink
