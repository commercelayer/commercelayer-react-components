import React, { FunctionComponent, CSSProperties, useContext } from 'react'
import { LineItemCollection } from '@commercelayer/js-sdk/dist/LineItem'
import { GeneralComponent } from '../@types/index'
import LineItemChildrenContext from './context/LineItemChildrenContext'
import LineItemContext from './context/LineItemContext'
import Parent from './utils/Parent'

export interface LineItemQuantityProps extends GeneralComponent {
  children?: FunctionComponent
  lineItem?: LineItemCollection
  updateLineItem?: (lineItemId, quantity) => void
}

const LineItemQuantity: FunctionComponent<LineItemQuantityProps> = props => {
  const { lineItem } = useContext(LineItemChildrenContext)
  const { updateLineItem } = useContext(LineItemContext)
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
    updateLineItem(lineItem.id, quantity)
  }
  const parentProps = {
    handleChange,
    quantity: lineItem.quantity,
    ...props
  }
  return props.children ? (
    <Parent {...parentProps}>{props.children}</Parent>
  ) : (
    <select value={lineItem.quantity} onChange={handleChange} {...props}>
      {options}
    </select>
  )
}

export default LineItemQuantity
