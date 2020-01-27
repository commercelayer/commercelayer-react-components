import { GeneralReducer, GeneralActions } from '../@types/index'
import { PriceCollection } from '@commercelayer/js-sdk'

export interface PricesInterface {
  [key: string]: PriceCollection
}

export interface PriceState {
  loading: boolean
  prices: PricesInterface
  skuCode?: string
}

export interface PriceActions extends GeneralActions {
  type: 'setLoading' | 'setPrices'
}

export const priceInitialState: PriceState = {
  loading: false,
  prices: {}
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
  return state
}

export default priceReducer
