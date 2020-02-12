import { BaseReducer, BaseAction } from '../@types/index'
import { SkuCollection, InventoryCollection } from '@commercelayer/js-sdk'
import { SkuCodePropObj } from '../components/VariantSelector'
import { Dispatch } from 'react'
import baseReducer from '../utils/baseReducer'

export interface SetCurrentQuantity {
  (quantity: number): void
}

export interface SetSkuCodeVariant {
  (code: string, id: string): void
}

export interface SetVariantSkuCodes {
  (skuCodes: SkuCodePropObj[], dispatch: Dispatch<VariantAction>): void
}

export interface VariantsObject {
  [key: string]: SkuCollection
}

export interface VariantState {
  loading?: boolean
  variants?: VariantsObject
  skuCodes?: string[]
  skuCode?: string
  currentSkuId?: string
  currentSkuInventory?: InventoryCollection
  currentQuantity?: number
  currentPrices?: SkuCollection[]
  setSkuCode?: SetSkuCodeVariant
  setSkuCodes?: (skuCodes: SkuCodePropObj[]) => void
  setCurrentQuantity?: SetCurrentQuantity
}

export interface VariantAction {
  type: VariantActionType
  payload: VariantState
}

export const setVariantSkuCodes: SetVariantSkuCodes = (skuCodes, dispatch) => {
  const sCodes = skuCodes.map(s => s.code)
  dispatch({
    type: 'setSkuCodes',
    payload: { skuCodes: sCodes }
  })
}

export interface UnsetVariantState {
  (dispatch: Dispatch<VariantAction>): void
}

export const unsetVariantState: UnsetVariantState = dispatch => {
  dispatch({
    type: 'setSkuCode',
    payload: { skuCode: '' }
  })
  dispatch({
    type: 'setVariants',
    payload: { variants: {} }
  })
  dispatch({
    type: 'setLoading',
    payload: { loading: false }
  })
}

export const variantInitialState: VariantState = {
  loading: false,
  variants: {},
  skuCodes: [],
  skuCode: '',
  currentSkuId: '',
  currentSkuInventory: {
    available: false,
    quantity: 0,
    levels: []
  },
  currentQuantity: 1,
  currentPrices: []
}

export type VariantActionType =
  | 'setLoading'
  | 'setVariants'
  | 'setSkuCodes'
  | 'setSkuCode'
  | 'setCurrentSkuId'
  | 'setCurrentSkuInventory'
  | 'setCurrentQuantity'
  | 'setCurrentPrices'

const actionType: VariantActionType[] = [
  'setLoading',
  'setVariants',
  'setSkuCodes',
  'setSkuCode',
  'setCurrentSkuId',
  'setCurrentSkuInventory',
  'setCurrentQuantity',
  'setCurrentPrices'
]

const variantReducer = (
  state: VariantState,
  reducer: VariantAction
): VariantState =>
  baseReducer<VariantState, VariantAction, VariantActionType[]>(
    state,
    reducer,
    actionType
  )

export default variantReducer
