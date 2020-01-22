import React, { FunctionComponent, CSSProperties } from 'react'
import { LineItemCollection } from '@commercelayer/js-sdk/dist/LineItem'
import { GeneralComponent } from '../@types/index'

export interface LineItemQuantityProps extends GeneralComponent {
  lineItem?: LineItemCollection
  updateLineItem?: (lineItemId, quantity) => void
}

const LineItemQuantity: FunctionComponent<LineItemQuantityProps> = props => {
  const options = []
  for (let i = 0; i < 50; i++) {
    options.push(
      <option key={i} value={i}>
        {i}
      </option>
    )
  }
  const handleChange = e => {
    const quantity = e.target.value
    props.updateLineItem(props.lineItem.id, quantity)
  }
  return (
    <select
      style={props.style}
      className={props.className}
      value={props.lineItem.quantity}
      onChange={handleChange}
    >
      {options}
    </select>
  )
}

export default LineItemQuantity
