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

export interface GiftCardProps extends GeneralComponent {
  format?: 'formatted' | 'cents' | 'float'
}

const GiftCard: FunctionComponent<GiftCardProps> = props => {
  const { format, ...p } = props
  const { order } = useContext(OrderContext)
  const [price, setPrice] = useState(null)
  useEffect(() => {
    const p = getAmount('amount', 'giftcard', format, order)
    setPrice(p)
    return () => {
      setPrice(null)
    }
  }, [order])
  return <span {...p}>{price}</span>
}

GiftCard.defaultProps = {
  format: 'formatted'
}

export default GiftCard
