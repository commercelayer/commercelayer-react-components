import { createContext } from 'react'
import {
  getLocalOrder,
  setLocalOrder,
  deleteLocalOrder
} from '#utils/localStorage'

export interface OrderStorageConfig {
  persistKey: string
  clearWhenPlaced: boolean
  getLocalOrder: typeof getLocalOrder
  setLocalOrder: typeof setLocalOrder
  deleteLocalOrder: typeof deleteLocalOrder
}

const initial: OrderStorageConfig = {
  persistKey: '',
  clearWhenPlaced: true,
  getLocalOrder,
  setLocalOrder,
  deleteLocalOrder
}

const OrderStorageContext = createContext<OrderStorageConfig>(initial)

export default OrderStorageContext
