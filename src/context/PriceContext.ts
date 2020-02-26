import { createContext } from 'react'
import { priceInitialState } from '../reducers/PriceReducer'

const PriceContext = createContext(priceInitialState)

export default PriceContext
