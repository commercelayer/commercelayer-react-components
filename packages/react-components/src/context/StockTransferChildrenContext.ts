import { createContext } from 'react'
import { type StockTransfer } from '@commercelayer/sdk'

export interface InitialStockTransferContext {
  stockTransfer?: StockTransfer
}

const initial: InitialStockTransferContext = {}

const StockTransferChildrenContext =
  createContext<InitialStockTransferContext>(initial)

export default StockTransferChildrenContext
