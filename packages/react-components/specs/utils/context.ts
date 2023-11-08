import { type TestContext } from 'vitest'

export interface LocalContext extends TestContext {
  accessToken: string
  endpoint: string
}

export interface OrderContext extends LocalContext {
  orderId: string
}

export interface SkusContext extends LocalContext {
  sku: string
  skus: string[]
  skuId: string
}
