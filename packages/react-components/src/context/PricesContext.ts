import { createContext } from 'react'
import { priceInitialState, type PriceState } from '#reducers/PriceReducer'

export interface PricesContextValue extends PriceState {
  skuCode: PriceState['skuCode']
}

const PricesContext = createContext(priceInitialState)

export default PricesContext
