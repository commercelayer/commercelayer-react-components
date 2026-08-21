import type { Price } from "@commercelayer/sdk"
import { createContext } from "react"
import type { LoaderType } from "#typings"
import type { BaseError } from "#typings/errors"

export type Prices = Record<string, Price[]>

export interface PricesContextValue {
  loading: boolean
  prices: Prices
  skuCodes: string[]
  errors?: BaseError[]
  skuCode?: string
  loader?: LoaderType
  setSkuCodes?: (params: { skuCodes: string[] }) => void
}

export const pricesInitialState: PricesContextValue = {
  loading: true,
  prices: {},
  skuCodes: [],
  errors: [],
}

const PricesContext = createContext<PricesContextValue>(pricesInitialState)

export default PricesContext
