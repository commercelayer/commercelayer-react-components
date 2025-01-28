import { createContext } from 'react'
import type { LineItem, StockTransfer } from '@commercelayer/sdk'

export interface InitialStockTransferContext {
  stockTransfer?: StockTransfer | null | LineItem
}

const initial: InitialStockTransferContext = {}

const StockTransferChildrenContext =
  createContext<InitialStockTransferContext>(initial)

export default StockTransferChildrenContext
