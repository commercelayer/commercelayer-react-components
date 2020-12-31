import { createContext } from 'react'
import { skuOptionsInitialState } from '@reducers/SkuOptionsReducer'

const SkuOptionsContext = createContext(skuOptionsInitialState)

export default SkuOptionsContext
