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

export interface AdjustmentProps extends GeneralComponent {
  order?: OrderCollection
  format?: 'formatted' | 'cents' | 'float'
}

const Adjustment: FunctionComponent<AdjustmentProps> = props => {
  const { format, ...p } = props
  const { order } = useContext(OrderContext)
  const [price, setPrice] = useState(null)
  useEffect(() => {
    const p = getAmount('amount', 'adjustment', format, order)
    setPrice(p)
    return () => {
      setPrice(null)
    }
  }, [order])
  return <span {...p}>{price}</span>
}

Adjustment.defaultProps = {
  format: 'formatted'
}

export default Adjustment
