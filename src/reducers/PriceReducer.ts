import { BaseAction, LoaderType } from '#typings'
import { Price } from '@commercelayer/sdk'
import getPrices from '#utils/getPrices'
import { CommerceLayerConfig } from '#context/CommerceLayerContext'
import { Dispatch } from 'react'
import { ItemPrices } from './ItemReducer'
import baseReducer from '#utils/baseReducer'
import getErrorsByCollection from '#utils/getErrorsByCollection'
import { BaseError } from '#typings/errors'
import getSdk from '#utils/getSdk'

export interface Prices {
  [key: string]: Price | Price[]
}

type SkuCodesPrice = string[]

export interface SetSkuCodesPrice {
  (skuCodes: SkuCodesPrice): void
}

export interface PriceState {
  loading: boolean
  prices: Prices
  skuCodes: SkuCodesPrice
  errors?: BaseError[]
  skuCode?: string
  setSkuCodes?: SetSkuCodesPrice
  loader?: LoaderType
}

export interface PriceAction extends BaseAction {
  type: PriceActionType
}

export const priceInitialState: PriceState = {
  loading: true,
  prices: {},
  skuCodes: [],
  errors: [],
}

export interface GetSkusPrice {
  (
    skuCodes: SkuCodesPrice,
    options: {
      config: CommerceLayerConfig
      dispatch: Dispatch<PriceAction>
      setPrices: ((item: ItemPrices) => void) | undefined
      prices: ItemPrices
      perPage: number
      filters: Record<string, any>
    }
  ): void
}

export const getSkusPrice: GetSkusPrice = (
  skuCodes,
  { config, dispatch, setPrices, prices, perPage, filters }
) => {
  let allPrices = {}
  const sdk = getSdk(config)
  sdk.prices
    .list({
      filters: { sku_code_in: skuCodes.join(','), ...filters },
      pageSize: perPage,
    })
    .then(async (response) => {
      console.log(`response`, response)
      const pricesObj = getPrices(response)
      allPrices = { ...allPrices, ...prices, ...pricesObj }
      if (setPrices) {
        setPrices(allPrices)
      }
      dispatch({
        type: 'setPrices',
        payload: { prices: allPrices },
      })
      dispatch({
        type: 'setLoading',
        payload: { loading: false },
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
            pageNumber,
          })
          const pricesObj = getPrices(pageResponse)
          allPrices = { ...allPrices, ...pricesObj }
          if (setPrices) {
            setPrices(allPrices)
          }
          dispatch({
            type: 'setPrices',
            payload: { prices: allPrices },
          })
        }
      }
    })
    .catch((error) => {
      const errors = getErrorsByCollection(error, 'price')
      dispatch({
        type: 'setErrors',
        payload: {
          errors,
        },
      })
    })
}

export interface UnsetPriceState {
  (dispatch: Dispatch<PriceAction>): void
}

export const unsetPriceState: UnsetPriceState = (dispatch) => {
  dispatch({
    type: 'setPrices',
    payload: {
      prices: {},
    },
  })
  dispatch({
    type: 'setLoading',
    payload: { loading: false },
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
  'setErrors',
]

const priceReducer = (state: PriceState, reducer: PriceAction): PriceState =>
  baseReducer<PriceState, PriceAction, PriceActionType[]>(
    state,
    reducer,
    typeAction
  )

export default priceReducer
