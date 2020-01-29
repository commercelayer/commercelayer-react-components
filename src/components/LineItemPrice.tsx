import React, {
  Fragment,
  FunctionComponent,
  useState,
  useEffect,
  useContext
} from 'react'
import _ from 'lodash'
import getAmount from '../utils/getAmount'
import LineItemChildrenContext from './context/LineItemChildrenContext'
import Parent from './utils/Parent'
import { GeneralComponent } from '../@types/index'

export interface LineItemPriceProps extends GeneralComponent {
  format?: 'formatted' | 'cents' | 'float'
  type?: 'total' | 'option' | 'unit'
  children?: FunctionComponent
}

const LineItemPrice: FunctionComponent<LineItemPriceProps> = props => {
  const { format, type, ...p } = props
  const { lineItem } = useContext(LineItemChildrenContext)
  const [price, setPrice] = useState(null)
  useEffect(() => {
    const p = getAmount('amount', type, format, lineItem)
    setPrice(p)
    return () => {
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

LineItemPrice.defaultProps = {
  format: 'formatted',
  type: 'total'
}

export default LineItemPrice
