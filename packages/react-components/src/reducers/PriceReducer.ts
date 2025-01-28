import type { BaseAction, LoaderType } from '#typings'
import type { QueryPageSize, Price } from '@commercelayer/sdk'
import getPrices from '#utils/getPrices'
import type { CommerceLayerConfig } from '#context/CommerceLayerContext'
import type { Dispatch } from 'react'
import baseReducer from '#utils/baseReducer'
import type { BaseError, TAPIError } from '#typings/errors'
import getSdk from '#utils/getSdk'
import getErrors from '#utils/getErrors'

export type Prices = Record<string, Price | Price[]>

type SkuCodesPrice = string[]

export interface PriceState {
  loading: boolean
  prices: Prices
  skuCodes: SkuCodesPrice
  errors?: BaseError[]
  skuCode?: string
  setSkuCodes?: typeof setSkuCodes
  loader?: LoaderType
}

export interface PriceAction extends BaseAction {
  type: PriceActionType
}

export const priceInitialState: PriceState = {
  loading: true,
  prices: {},
  skuCodes: [],
  errors: []
}

export function setSkuCodes({
  skuCodes,
  dispatch
}: {
  skuCodes: SkuCodesPrice
  dispatch?: Dispatch<PriceAction>
}): void {
  if (dispatch) {
    dispatch({
      type: 'setSkuCodes',
      payload: { skuCodes }
    })
  }
}

export function getSkusPrice(
  skuCodes: SkuCodesPrice,
  {
    config,
    dispatch,
    perPage,
    filters
  }: {
    config: CommerceLayerConfig
    dispatch: Dispatch<PriceAction>
    perPage: QueryPageSize
    filters: Record<string, any>
  }
): void {
  let allPrices = {}
  const sdk = getSdk(config)
  sdk.prices
    .list({
      filters: { sku_code_in: skuCodes.join(','), ...filters },
      pageSize: perPage
    })
    .then(async (response) => {
      const pricesObj = getPrices(response)
      allPrices = { ...allPrices, ...pricesObj }
      dispatch({
        type: 'setPrices',
        payload: { prices: allPrices }
      })
      dispatch({
        type: 'setLoading',
        payload: { loading: false }
      })
      const meta = response.meta
      if (meta.pageCount > 1) {
        for (
          let pageNumber = meta.currentPage + 1;
          pageNumber <= meta.pageCount;
          pageNumber++
        ) {
          const pageResponse = await sdk.prices.list({
            filters: { sku_code_in: skuCodes.join(','), ...filters },
            pageSize: perPage,
            pageNumber
          })
          const pricesObj = getPrices(pageResponse)
          allPrices = { ...allPrices, ...pricesObj }
          dispatch({
            type: 'setPrices',
            payload: { prices: allPrices }
          })
        }
      }
    })
    .catch((error: TAPIError) => {
      const errors = getErrors({
        error,
        resource: 'prices'
      })
      dispatch({
        type: 'setErrors',
        payload: {
          errors
        }
      })
    })
}

export type UnsetPriceState = (dispatch: Dispatch<PriceAction>) => void

export const unsetPriceState: UnsetPriceState = (dispatch) => {
  dispatch({
    type: 'setPrices',
    payload: {
      prices: {}
    }
  })
  dispatch({
    type: 'setLoading',
    payload: { loading: false }
  })
}

export type PriceActionType =
  | 'setLoading'
  | 'setPrices'
  | 'setSkuCodes'
  | 'setErrors'

const typeAction: PriceActionType[] = [
  'setLoading',
  'setPrices',
  'setSkuCodes',
  'setErrors'
]

const priceReducer = (state: PriceState, reducer: PriceAction): PriceState =>
  baseReducer<PriceState, PriceAction, PriceActionType[]>(
    state,
    reducer,
    typeAction
  )

export default priceReducer
