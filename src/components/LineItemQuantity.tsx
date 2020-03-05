import React, { FunctionComponent, useContext } from 'react'
import { BaseComponent } from '../@types/index'
import LineItemChildrenContext from '../context/LineItemChildrenContext'
import LineItemContext from '../context/LineItemContext'
import Parent from './utils/Parent'
import PropTypes, { InferProps } from 'prop-types'

const LIQProps = {
  children: PropTypes.func,
  max: PropTypes.number,
  disabled: PropTypes.bool
}

export type LineItemQuantityProps = InferProps<typeof LIQProps> & BaseComponent

const LineItemQuantity: FunctionComponent<LineItemQuantityProps> = props => {
  const { lineItem } = useContext(LineItemChildrenContext)
  const { updateLineItem } = useContext(LineItemContext)
  const options = []
  for (let i = 1; i <= props.max; i++) {
    options.push(
      <option key={i} value={i}>
        {i}
      </option>
    )
  }
  const handleChange = (e): void => {
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

LineItemQuantity.propTypes = LIQProps

LineItemQuantity.defaultProps = {
  max: 50
}

export default LineItemQuantity
