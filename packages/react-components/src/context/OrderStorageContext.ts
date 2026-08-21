import type { DeleteLocalOrder, GetLocalOrder, SetLocalOrder } from "@commercelayer/core-components"
import { deleteLocalOrder, getLocalOrder, setLocalOrder } from "@commercelayer/core-components"
import { createContext } from "react"

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
