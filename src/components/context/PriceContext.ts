import { createContext } from 'react'
import { PriceState } from '../../reducers/PriceReducer'

const initial: PriceState = {
  loading: false,
  prices: {},
  skuCode: '',
  skuCodes: []
}

const PriceContext = createContext(initial)

export default PriceContext
