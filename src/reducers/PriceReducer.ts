import { BaseAction } from '../@types/index'
import CLayer, { PriceCollection } from '@commercelayer/js-sdk'
import getPrices from '../utils/getPrices'
import { CommerceLayerConfig } from '../context/CommerceLayerContext'
import { Dispatch, ReactElement } from 'react'
import getSkus from '../utils/getSkus'
import { Items } from './ItemReducer'
import baseReducer from '../utils/baseReducer'
import getErrorsByCollection from '../utils/getErrorsByCollection'
import { BaseError } from '../components/Errors'

export interface Prices {
  [key: string]: PriceCollection
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
  loader?: ReactElement
}

export interface PriceAction extends BaseAction {
  type: PriceActionType
}

export const priceInitialState: PriceState = {
  loading: false,
  prices: {},
  skuCodes: [],
  errors: []
}

export interface GetSkusPrice {
  (
    skuCodes: SkuCodesPrice,
    options?: {
      config: CommerceLayerConfig
      dispatch: Dispatch<PriceAction>
      setItems: (item: Items | object) => void
      items: Items
    }
  ): void
}

export const getSkusPrice: GetSkusPrice = (
  skuCodes,
  { config, dispatch, setItems, items }
) => {
  CLayer.Sku.withCredentials(config)
    .where({ codeIn: skuCodes.join(',') })
    .includes('prices')
    .perPage(25)
    .all()
    .then(r => {
      const pricesObj = getPrices(r.toArray())
      const i = getSkus(r.toArray())
      if (setItems) {
        setItems({ ...items, ...i })
      }
      dispatch({
        type: 'setPrices',
        payload: { prices: pricesObj }
      })
      dispatch({
        type: 'setLoading',
        payload: { loading: false }
      })

      if (r.hasNextPage()) {
        debugger
        // NOTE Add type to SDK
        // @ts-ignore
        r.withCredentials(config)
          .nextPage()
          .then(r => {
            debugger
            const pricesObj = getPrices(r.toArray())
            const i = getSkus(r.toArray())
            if (setItems) {
              setItems({ ...items, ...i })
            }
            dispatch({
              type: 'setPrices',
              payload: { prices: pricesObj }
            })
            dispatch({
              type: 'setLoading',
              payload: { loading: false }
            })
          })
      }

      if (r.hasPrevPage()) {
        // NOTE Add type to SDK
        // @ts-ignore
        r.withCredentials(config)
          .prevPage()
          .then(r => {
            const pricesObj = getPrices(r.toArray())
            const i = getSkus(r.toArray())
            if (setItems) {
              setItems({ ...items, ...i })
            }
            dispatch({
              type: 'setPrices',
              payload: { prices: pricesObj }
            })
            dispatch({
              type: 'setLoading',
              payload: { loading: false }
            })
          })
      }
    })
    .catch(c => {
      const errors = getErrorsByCollection(c, 'price')
      dispatch({
        type: 'setErrors',
        payload: {
          errors
        }
      })
    })
}

export interface UnsetPriceState {
  (dispatch: Dispatch<PriceAction>): void
}

export const unsetPriceState: UnsetPriceState = dispatch => {
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
