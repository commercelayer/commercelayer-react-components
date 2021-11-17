import { createContext } from 'react'
import { StockTransfer } from '@commercelayer/sdk'

export interface InitialStockTransferContext {
  stockTransfer?: StockTransfer
}

const initial: InitialStockTransferContext = {}

const StockTransferChildrenContext =
  createContext<InitialStockTransferContext>(initial)

export default StockTransferChildrenContext
