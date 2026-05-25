import { createContext } from "react"
import type { GetLocalOrder, SetLocalOrder, DeleteLocalOrder } from "@commercelayer/core"
import { getLocalOrder, setLocalOrder, deleteLocalOrder } from "@commercelayer/core"

export interface OrderStorageConfig {
  persistKey: string
  clearWhenPlaced: boolean
  getLocalOrder: GetLocalOrder
  setLocalOrder: SetLocalOrder
  deleteLocalOrder: DeleteLocalOrder
}

const initial: OrderStorageConfig = {
  persistKey: "",
  clearWhenPlaced: true,
  getLocalOrder,
  setLocalOrder,
  deleteLocalOrder,
}

const OrderStorageContext = createContext<OrderStorageConfig>(initial)

export default OrderStorageContext
