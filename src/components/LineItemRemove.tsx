import React, { FunctionComponent } from 'react'
import { LineItemCollection } from '@commercelayer/js-sdk/dist/LineItem'

export interface LineItemRemove {
  lineItem?: LineItemCollection
  deleteLineItem?: (lineItemId: string) => void
  className?: string
  label?: string
}

const LineItemRemove: FunctionComponent<LineItemRemove> = props => {
  const handleRemove = e => {
    e.preventDefault()
    props.deleteLineItem(props.lineItem.id)
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
