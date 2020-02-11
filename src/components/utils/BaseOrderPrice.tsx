import OrderContext from '../../context/OrderContext'
import getAmount from '../../utils/getAmount'
import Parent from './Parent'
import React, {
  FunctionComponent,
  useState,
  useEffect,
  useContext
} from 'react'
import { BaseComponent } from '../../@types'

export interface BaseOrderPriceProps extends BaseComponent {
  format?: 'formatted' | 'cents' | 'float'
  base: string
  type: string
  children?: FunctionComponent
}
// TODO: Change name with Base
const BaseOrderPrice: FunctionComponent<BaseOrderPriceProps> = props => {
  const { format, base, type, ...p } = props
  const { order } = useContext(OrderContext)
  const [price, setPrice] = useState(null)
  useEffect(() => {
    const p = getAmount(base, type, format, order)
    setPrice(p)
    return (): void => {
      setPrice(null)
    }
  }, [order])
  const parentProps = {
    ...p
  }
  return props.children ? (
    <Parent {...parentProps}>{props.children}</Parent>
  ) : (
    <span {...p}>{price}</span>
  )
}

BaseOrderPrice.defaultProps = {
  format: 'formatted'
}

export default BaseOrderPrice
