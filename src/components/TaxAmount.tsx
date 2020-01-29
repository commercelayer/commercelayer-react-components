import React, {
  FunctionComponent,
  useState,
  useEffect,
  useContext
} from 'react'
import { GeneralComponent } from '../@types/index'
import { OrderCollection } from '@commercelayer/js-sdk'
import getAmount from '../utils/getAmount'
import OrderContext from './context/OrderContext'

export interface TaxAmountProps extends GeneralComponent {
  format?: 'formatted' | 'cents' | 'float'
}

const TaxAmount: FunctionComponent<TaxAmountProps> = props => {
  const { format, className, style } = props
  const { order } = useContext(OrderContext)
  const [price, setPrice] = useState(null)
  useEffect(() => {
    const p = getAmount('total', 'taxamount', format, order)
    setPrice(p)
    return () => {
      setPrice(null)
    }
  }, [order])
  return (
    <span style={style} className={className}>
      {price}
    </span>
  )
}

TaxAmount.defaultProps = {
  format: 'formatted'
}

export default TaxAmount
