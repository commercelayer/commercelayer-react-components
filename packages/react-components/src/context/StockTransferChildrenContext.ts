import type { LineItem, StockTransfer } from "@commercelayer/sdk"
import { createContext } from "react"

export interface InitialStockTransferContext {
  stockTransfer?: StockTransfer | null | LineItem
}

const initial: InitialStockTransferContext = {}

const StockTransferChildrenContext = createContext<InitialStockTransferContext>(initial)

export default StockTransferChildrenContext
