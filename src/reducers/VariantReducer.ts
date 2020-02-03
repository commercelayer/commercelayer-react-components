import { GeneralReducer, GeneralActions } from '../@types/index'
import { SkuCollection, InventoryCollection } from '@commercelayer/js-sdk'
import { SkuCodePropObj } from '../components/VariantSelector'

export interface SetCurrentQuantity {
  (quantity: number): void
}

export interface SetSkuCodeVariant {
  (code: string, id: string): void
}

export interface SetSkuCodesVariant {
  (skuCodes: SkuCodePropObj[]): void
}

export interface VariantsObject {
  [key: string]: SkuCollection
}

export interface VariantState {
  active: boolean
  loading: boolean
  variants: VariantsObject
  skuCodes: string[]
  currentSkuCode: string
  currentSkuId: string
  currentSkuInventory:
    | InventoryCollection
    | {
        available: false
        quantity: 0
      }
  currentQuantity: number
  currentPrices: SkuCollection[]
  setSkuCode?: SetSkuCodeVariant
  setSkuCodes?: SetSkuCodesVariant
  setCurrentQuantity?: SetCurrentQuantity
}

export interface VariantActions extends GeneralActions {
  type:
    | 'setLoading'
    | 'setVariants'
    | 'setSkuCodes'
    | 'setCurrentSkuCode'
    | 'setCurrentSkuId'
    | 'setCurrentSkuInventory'
    | 'setCurrentQuantity'
    | 'setCurrentPrices'
}

export const variantInitialState: VariantState = {
  active: false,
  loading: false,
  variants: {},
  skuCodes: [],
  currentSkuCode: '',
  currentSkuId: '',
  currentSkuInventory: {
    available: false,
    quantity: 0
  },
  currentQuantity: 1,
  currentPrices: []
}

const variantReducer: GeneralReducer<VariantState, VariantActions> = (
  state,
  action
) => {
  const actions = [
    'setLoading',
    'setVariants',
    'setSkuCodes',
    'setCurrentSkuCode',
    'setCurrentSkuId',
    'setCurrentSkuInventory',
    'setCurrentQuantity',
    'setCurrentPrices'
  ]
  if (actions.indexOf(action.type)) {
    const data = action.payload
    state = { ...state, ...data }
  }
  return state
}

export default variantReducer
