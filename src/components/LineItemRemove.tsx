import React, { FunctionComponent, useContext } from 'react'
import { LineItemCollection } from '@commercelayer/js-sdk/dist/LineItem'
import LineItemChildrenContext from './context/LineItemChildrenContext'
import LineItemContext from './context/LineItemContext'

export interface LineItemRemove {
  deleteLineItem?: (lineItemId: string) => void
  className?: string
  label?: string
}

const LineItemRemove: FunctionComponent<LineItemRemove> = props => {
  const { lineItem } = useContext(LineItemChildrenContext)
  const { deleteLineItem } = useContext(LineItemContext)
  const handleRemove = e => {
    e.preventDefault()
    deleteLineItem(lineItem.id)
  }
  return (
    <a className={props.className} href="#" onClick={handleRemove}>
      {props.label}
    </a>
  )
}

LineItemRemove.defaultProps = {
  label: 'remove'
}

export default LineItemRemove
