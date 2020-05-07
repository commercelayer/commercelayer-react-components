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

const propTypes = components.LineItemAmount.propTypes
const defaultProps = components.LineItemAmount.defaultProps
const displayName = components.LineItemAmount.displayName

export type LineItemAmountProps = PropsType<typeof propTypes> &
  JSX.IntrinsicElements['span']

const LineItemAmount: FunctionComponent<LineItemAmountProps> = (props) => {
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

LineItemAmount.propTypes = propTypes
LineItemAmount.defaultProps = defaultProps
LineItemAmount.displayName = displayName

export default LineItemAmount
