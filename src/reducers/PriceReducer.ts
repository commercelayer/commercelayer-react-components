import { GeneralReducer, GeneralActions } from '../@types/index'
import CLayer, { PriceCollection } from '@commercelayer/js-sdk'
import getPrices from '../utils/getPrices'
import { CommerceLayerConfig } from '../components/context/CommerceLayerContext'
import { Dispatch } from 'react'
import { Items } from './OrderReducer'
import getSkus from '../utils/getSkus'

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
  skuCode?: string
  setSkuCodes?: SetSkuCodesPrice
}

export interface PriceAction extends GeneralActions {
  type: 'setLoading' | 'setPrices' | 'setSkuCodes'
}

export const priceInitialState: PriceState = {
  loading: false,
  prices: {},
  skuCodes: []
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
        r.nextPage().then(r => {
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
        r.prevPage().then(r => {
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
}

export interface UnsetPriceState {
  (dispatch: Dispatch<PriceAction>): void
}

export const unsetPriceState: UnsetPriceState = dispatch => {
  // dispatch({
  //   type: 'setPrices',
  //   payload: {
  //     prices: {}
  //   }
  // })
  dispatch({
    type: 'setLoading',
    payload: { loading: false }
  })
}

const priceReducer: GeneralReducer<PriceState, PriceAction> = (
  state,
  action
) => {
  const actions = ['setLoading', 'setPrices', 'setSkuCodes']
  if (actions.indexOf(action.type) !== -1) {
    const data = action.payload
    state = { ...state, ...data }
  }
  return state
}

export default priceReducer
