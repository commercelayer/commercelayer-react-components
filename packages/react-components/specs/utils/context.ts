import type { TestContext } from "vitest"

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

export interface SkuListsContext extends LocalContext {
  skuListId: string
}

export interface AvailabilityContext extends LocalContext {
  skuCode: string
}

export interface PricesContext extends LocalContext {
  skuCode: string
}
