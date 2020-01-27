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

export interface LineItemPriceProps {
  format?: 'formatted' | 'cents' | 'float'
  type?: 'total' | 'option' | 'unit'
}

const LineItemPrice: FunctionComponent<LineItemPriceProps> = props => {
  const { format, type } = props
  const { lineItem } = useContext(LineItemChildrenContext)
  const [price, setPrice] = useState(null)
  useEffect(() => {
    const p = getAmount('amount', type, format, lineItem)
    setPrice(p)
    return () => {
      setPrice('')
    }
  }, [lineItem])

  return <Fragment>{price}</Fragment>
}

LineItemPrice.defaultProps = {
  format: 'formatted',
  type: 'total'
}

export default LineItemPrice
