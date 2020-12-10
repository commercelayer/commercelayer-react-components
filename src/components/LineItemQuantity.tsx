import React, { FunctionComponent, useContext, ReactNode } from 'react'
import LineItemChildrenContext from '../context/LineItemChildrenContext'
import LineItemContext from '../context/LineItemContext'
import Parent from './utils/Parent'
import components from '../config/components'
import { FunctionChildren } from '../typings'

const propTypes = components.LineItemQuantity.propTypes
const defaultProps = components.LineItemQuantity.defaultProps
const displayName = components.LineItemQuantity.displayName

type LineItemQuantityChildrenProps = FunctionChildren<
  Omit<LineItemQuantityProps, 'children'> & {
    quantity: number
    handleChange: (event: React.MouseEvent<HTMLSelectElement>) => void
  }
>

type LineItemQuantityProps = {
  children?: LineItemQuantityChildrenProps
  max?: number
  disabled?: boolean
  readonly?: boolean
} & (JSX.IntrinsicElements['select'] & JSX.IntrinsicElements['span'])

const LineItemQuantity: FunctionComponent<LineItemQuantityProps> = (props) => {
  const { max = 50, readonly = false } = props
  const { lineItem } = useContext(LineItemChildrenContext)
  const { updateLineItem } = useContext(LineItemContext)
  const options: ReactNode[] = []
  for (let i = 1; i <= max; i++) {
    options.push(
      <option key={i} value={`${i}`}>
        {i}
      </option>
    )
  }
  const handleChange = (e: React.ChangeEvent<HTMLSelectElement>): void => {
    const quantity = Number(e.target.value)
    updateLineItem && updateLineItem(lineItem['id'], quantity)
  }
  const quantity = lineItem['quantity']
  const parentProps = {
    handleChange,
    quantity,
    ...props,
  }
  return props.children ? (
    <Parent {...parentProps}>{props.children}</Parent>
  ) : readonly ? (
    <span {...props}>{quantity}</span>
  ) : (
    <select value={quantity} onChange={handleChange} {...props}>
      {options}
    </select>
  )
}

LineItemQuantity.propTypes = propTypes
LineItemQuantity.defaultProps = defaultProps
LineItemQuantity.displayName = displayName

export default LineItemQuantity
