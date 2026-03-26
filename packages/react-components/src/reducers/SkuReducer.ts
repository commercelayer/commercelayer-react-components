import type { Sku } from '@commercelayer/sdk'

export type SkuState = Partial<{
  skus: Sku[]
  loading: boolean
  skuCodes: string[]
}>
