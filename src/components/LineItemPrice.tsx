import React, {
  FunctionComponent,
  useState,
  useEffect,
  useContext,
} from 'react'
import getAmount from '../utils/getAmount'
import LineItemChildrenContext from '../context/LineItemChildrenContext'
import Parent from './utils/Parent'
import { PropsType } from '../utils/PropsType'
import components from '../config/components'

const propTypes = components.LineItemPrice.propTypes
const defaultProps = components.LineItemPrice.defaultProps
const displayName = components.LineItemPrice.displayName

export type LineItemPriceProps = PropsType<typeof propTypes> &
  JSX.IntrinsicElements['span']

const LineItemPrice: FunctionComponent<LineItemPriceProps> = (props) => {
  const { format, type, ...p } = props
  const { lineItem } = useContext(LineItemChildrenContext)
  const [price, setPrice] = useState('')
  useEffect(() => {
    const p = getAmount('amount', type as string, format as string, lineItem)
    setPrice(p)
    return (): void => {
      setPrice('')
    }
  }, [lineItem])
  const parentProps = {
    price,
    ...p,
  }
  return props.children ? (
    <Parent {...parentProps}>{props.children}</Parent>
  ) : (
    <span {...p}>{price}</span>
  )
}

LineItemPrice.propTypes = propTypes
LineItemPrice.defaultProps = defaultProps
LineItemPrice.displayName = displayName

export default LineItemPrice
