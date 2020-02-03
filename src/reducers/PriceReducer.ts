import { GeneralReducer, GeneralActions } from '../@types/index'
import { PriceCollection } from '@commercelayer/js-sdk'

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
  const actions = ['setLoading', 'setPrices', 'setSkuCodes']
  if (actions.indexOf(action.type)) {
    const data = action.payload
    state = { ...state, ...data }
  }
  return state
}

export default priceReducer
