import { GeneralReducer, GeneralActions } from '../@types/index'
import { PriceCollection } from '@commercelayer/js-sdk'

export interface PricesInterface {
  [key: string]: PriceCollection
}

type SkuCodesPrice = string[]

export interface SetSkuCodesPrice {
  (skuCodes: SkuCodesPrice): void
}

export interface PriceState {
  loading: boolean
  prices: PricesInterface
  skuCodes: SkuCodesPrice
  skuCode?: string
  setSkuCodes?: SetSkuCodesPrice
}

export interface PriceActions extends GeneralActions {
  type: 'setLoading' | 'setPrices' | 'setSkuCodes'
}

export const priceInitialState: PriceState = {
  loading: false,
  prices: {},
  skuCodes: []
}

const priceReducer: GeneralReducer<PriceState, PriceActions> = (
  state,
  action
) => {
  if (action.type === 'setLoading') {
    state = { ...state, loading: action.payload }
  }
  if (action.type === 'setPrices') {
    state = { ...state, prices: action.payload }
  }
  if (action.type === 'setSkuCodes') {
    state = { ...state, skuCodes: action.payload }
  }
  return state
}

export default priceReducer
