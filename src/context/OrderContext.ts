import { createContext } from 'react'
import { orderInitialState, OrderState } from '#reducers/OrderReducer'

const OrderContext = createContext<OrderState>(orderInitialState as OrderState)

export default OrderContext
