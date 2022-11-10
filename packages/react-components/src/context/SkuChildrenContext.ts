import { createContext } from 'react'
import { Sku } from '@commercelayer/sdk'

export type InitialSkuContext = Partial<{
  sku: Sku
}>

const initial: InitialSkuContext = {}

const SkuChildrenContext = createContext<InitialSkuContext>(initial)

export default SkuChildrenContext
