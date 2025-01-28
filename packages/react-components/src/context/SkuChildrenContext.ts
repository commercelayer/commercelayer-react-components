import { createContext } from 'react'
import type { Sku } from '@commercelayer/sdk'

export type InitialSkuContext = Partial<{
  sku: Sku
}>

const initial: InitialSkuContext = {}

const SkuChildrenContext = createContext<InitialSkuContext>(initial)

export default SkuChildrenContext
