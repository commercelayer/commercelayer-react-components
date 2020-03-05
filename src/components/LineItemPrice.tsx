import React, {
  FunctionComponent,
  useState,
  useEffect,
  useContext
} from 'react'
import getAmount from '../utils/getAmount'
import LineItemChildrenContext from '../context/LineItemChildrenContext'
import Parent from './utils/Parent'
import { BaseComponent } from '../@types/index'
import { BaseOrderComponentProps, BOCProps } from './utils/BaseOrderPrice'
import PropTypes, { InferProps } from 'prop-types'

type TypePrice = 'total' | 'option' | 'unit'

const LIPProps = {
  ...BOCProps,
  type: PropTypes.oneOf<TypePrice>(['total', 'unit', 'option'])
}

export type LineItemPriceProps = InferProps<typeof LIPProps> &
  BaseOrderComponentProps

const LineItemPrice: FunctionComponent<LineItemPriceProps> = props => {
  const { format, type, ...p } = props
  const { lineItem } = useContext(LineItemChildrenContext)
  const [price, setPrice] = useState(null)
  useEffect(() => {
    const p = getAmount('amount', type, format, lineItem)
    setPrice(p)
    return (): void => {
      setPrice('')
    }
  }, [lineItem])
  const parentProps = {
    price,
    ...p
  }
  return props.children ? (
    <Parent {...parentProps}>{props.children}</Parent>
  ) : (
    <span {...p}>{price}</span>
  )
}

LineItemPrice.propTypes = LIPProps

LineItemPrice.defaultProps = {
  format: 'formatted',
  type: 'total'
}

export default LineItemPrice
