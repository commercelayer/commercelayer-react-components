import React, {
  FunctionComponent,
  useState,
  useEffect,
  useContext
} from 'react'
import { GeneralComponent } from '../@types/index'
import getAmount from '../utils/getAmount'
import OrderContext from './context/OrderContext'

export interface PaymentMethodProps extends GeneralComponent {
  format?: 'formatted' | 'cents' | 'float'
}

const PaymentMethod: FunctionComponent<PaymentMethodProps> = props => {
  const { format, ...p } = props
  const { order } = useContext(OrderContext)
  const [price, setPrice] = useState(null)
  useEffect(() => {
    const p = getAmount('total', 'paymentMethod', format, order)
    setPrice(p)
    return () => {
      setPrice(null)
    }
  }, [order])
  return <span {...p}>{price}</span>
}

PaymentMethod.defaultProps = {
  format: 'formatted'
}

export default PaymentMethod
