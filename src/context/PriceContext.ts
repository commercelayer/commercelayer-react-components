import { createContext } from 'react'
import { priceInitialState, PriceState } from '../reducers/PriceReducer'

export interface PriceContextValue extends PriceState {
  skuCode: PriceState['skuCode']
}

const PriceContext = createContext(priceInitialState)

export default PriceContext
