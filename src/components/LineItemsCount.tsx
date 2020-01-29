import React, {
  FunctionComponent,
  useContext,
  useState,
  useEffect
} from 'react'
import { GeneralComponent } from '../@types/index'
import Parent from './utils/Parent'
import OrderContext from './context/OrderContext'
import getLineItemsCount from '../utils/getLineItemsCount'

export interface LineItemsCountProps extends GeneralComponent {
  children?: FunctionComponent
}

const LineItemsCount: FunctionComponent<LineItemsCountProps> = props => {
  const { children, ...p } = props
  const { order } = useContext(OrderContext)
  const [quantity, setQuantity] = useState(0)
  useEffect(() => {
    if (order) {
      const lineItems = order.lineItems().toArray()
      const qty = getLineItemsCount(lineItems)
      setQuantity(qty)
    }
    return (): void => {
      setQuantity(0)
    }
  }, [order])
  const parentProps = {
    quantity,
    ...p
  }
  return children ? (
    <Parent {...parentProps}>{children}</Parent>
  ) : (
    <span {...p}>{quantity}</span>
  )
}

export default LineItemsCount
