import { createContext } from 'react'
import { priceInitialState, PriceState } from '#reducers/PriceReducer'

export interface PricesContextValue extends PriceState {
  skuCode: PriceState['skuCode']
}

const PricesContext = createContext(priceInitialState)

export default PricesContext
