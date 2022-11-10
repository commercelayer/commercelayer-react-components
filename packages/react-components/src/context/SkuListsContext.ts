import { createContext } from 'react'
import { skuListsInitialState } from '#reducers/SkuListsReducer'

export const SkuListsContext = createContext(skuListsInitialState)

export default SkuListsContext
