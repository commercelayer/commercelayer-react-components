import { createContext } from 'react'
import { orderInitialState } from '../reducers/OrderReducer'

const OrderContext = createContext(orderInitialState)

export default OrderContext
