import React, { FunctionComponent, useContext } from 'react'
import LineItemChildrenContext from '../context/LineItemChildrenContext'
import LineItemContext from '../context/LineItemContext'
import Parent from './utils/Parent'
import { BaseComponent } from '../@types/index'
import PropTypes, { InferProps } from 'prop-types'

const LIRProps = {
  children: PropTypes.func,
  label: PropTypes.string
}

export type LineItemRemoveProps = InferProps<typeof LIRProps> & BaseComponent

const LineItemRemove: FunctionComponent<LineItemRemoveProps> = props => {
  const { lineItem } = useContext(LineItemChildrenContext)
  const { deleteLineItem } = useContext(LineItemContext)
  const handleRemove = (e): void => {
    e.preventDefault()
    deleteLineItem(lineItem.id)
  }
  const parentProps = {
    handleRemove,
    ...props
  }
  return props.children ? (
    <Parent {...parentProps}>{props.children}</Parent>
  ) : (
    <a {...props} href="#" onClick={handleRemove}>
      {props.label}
    </a>
  )
}

LineItemRemove.propTypes = LIRProps

LineItemRemove.defaultProps = {
  label: 'remove'
}

export default LineItemRemove
