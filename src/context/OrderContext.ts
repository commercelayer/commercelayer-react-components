import { createContext } from 'react'
import { OrderState } from '../reducers/OrderReducer'

const initial: OrderState = {
  loading: false,
  orderId: '',
  order: null,
  items: {}
}

const OrderContext = createContext(initial)

export default OrderContext
