import type { Sku } from '@commercelayer/sdk'
import { createContext } from 'react'

export type SkuContextValue = Partial<{
  skus: Sku[]
  loading: boolean
  skuCodes: string[]
}>

const SkuContext = createContext<SkuContextValue>({})

export default SkuContext
