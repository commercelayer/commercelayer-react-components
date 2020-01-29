import React, {
  FunctionComponent,
  useState,
  useEffect,
  useContext
} from 'react'
import { GeneralComponent } from '../@types/index'
import getAmount from '../utils/getAmount'
import OrderContext from './context/OrderContext'

export interface FeesProps extends GeneralComponent {
  format?: 'formatted' | 'cents' | 'float'
}

const Fees: FunctionComponent<FeesProps> = props => {
  const { format, ...p } = props
  const { order } = useContext(OrderContext)
  const [price, setPrice] = useState(null)
  useEffect(() => {
    const p = getAmount('total', 'fees', format, order)
    setPrice(p)
    return () => {
      setPrice(null)
    }
  }, [order])
  return <span {...p}>{price}</span>
}

Fees.defaultProps = {
  format: 'formatted'
}

export default Fees
