import { BaseAction, LoaderType } from '../@types'
import CLayer, { PriceCollection } from '@commercelayer/js-sdk'
import getPrices from '../utils/getPrices'
import { CommerceLayerConfig } from '../context/CommerceLayerContext'
import { Dispatch } from 'react'
import { ItemPrices } from './ItemReducer'
import baseReducer from '../utils/baseReducer'
import getErrorsByCollection from '../utils/getErrorsByCollection'
import { BaseError } from '../@types/errors'

export type SkuPrices = PriceCollection[]

export interface Prices {
  [key: string]: SkuPrices
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
      filters: object
    }
  ): void
}

export const getSkusPrice: GetSkusPrice = (
  skuCodes,
  { config, dispatch, setPrices, prices, perPage, filters }
) => {
  let allPrices = {}
  CLayer.Price.withCredentials(config)
    .where({ skuCodeIn: skuCodes.join(','), ...filters })
    .perPage(perPage)
    .all()
    .then(async (r) => {
      const pricesObj = getPrices(r.toArray())
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
      const meta = r.getMetaInfo()
      let col = r
      if (col.hasNextPage() && meta.pageCount) {
        for (let key = 1; key < meta.pageCount; key++) {
          col = await col.withCredentials(config).nextPage()
          const pricesObj = getPrices(col.toArray())
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
    .catch((c) => {
      const errors = getErrorsByCollection(c, 'price')
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
