import type { SkuState } from '#reducers/SkuReducer'
import { createContext } from 'react'

export type SkuContextValue = SkuState

const SkuContext = createContext<SkuContextValue>({})

export default SkuContext
