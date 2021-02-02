import { createContext } from 'react'
import { StockTransferCollection } from '@commercelayer/js-sdk'

export interface InitialStockTransferContext {
  stockTransfer: StockTransferCollection | Record<string, string>
}

const initial: InitialStockTransferContext = {
  stockTransfer: {},
}

const StockTransferChildrenContext = createContext<InitialStockTransferContext>(
  initial
)

export default StockTransferChildrenContext
