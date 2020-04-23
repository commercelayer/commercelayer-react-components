import CLayer, {
  SkuCollection,
  InventoryCollection,
} from '@commercelayer/js-sdk'
import { SkuCodePropObj } from '../components/VariantSelector'
import { Dispatch } from 'react'
import baseReducer from '../utils/baseReducer'
import getErrorsByCollection from '../utils/getErrorsByCollection'
import getSkus from '../utils/getSkus'
import { CommerceLayerConfig } from '../context/CommerceLayerContext'
import { Items } from './ItemReducer'
import { BaseError } from '../@types/errors'

type SetSkuCodeVariantParams = {
  code: string
  id: string
  config: CommerceLayerConfig
  dispatch: Dispatch<VariantAction>
  setItem: ((item: Items) => void) | undefined
}

export interface SetSkuCodeVariant {
  (params: SetSkuCodeVariantParams): void
}

export interface SetVariantSkuCodes {
  (skuCodes: SkuCodePropObj[], dispatch: Dispatch<VariantAction>): void
}

export interface VariantsObject {
  [key: string]: SkuCollection
}

export interface VariantPayload {
  loading?: boolean
  variants?: VariantsObject | object
  skuCodes?: string[]
  skuCode?: string
  errors?: BaseError[]
  currentSkuId?: string
  currentSkuInventory?: InventoryCollection
  currentQuantity?: number
  currentPrices?: SkuCollection[]
  setSkuCode?: (code, id) => void
  setSkuCodes?: (skuCodes: SkuCodePropObj[]) => void
}

export interface VariantState extends VariantPayload {
  skuCodes: string[]
  variants: VariantsObject | object
}

export interface VariantAction {
  type: VariantActionType
  payload: VariantPayload
}

export const setVariantSkuCodes: SetVariantSkuCodes = (skuCodes, dispatch) => {
  const sCodes = skuCodes.map((s) => s.code)
  dispatch({
    type: 'setSkuCodes',
    payload: { skuCodes: sCodes },
  })
}

export interface UnsetVariantState {
  (dispatch: Dispatch<VariantAction>): void
}

export const setSkuCode: SetSkuCodeVariant = (params) => {
  const { id, code, config, setItem, dispatch } = params
  if (id) {
    CLayer.Sku.withCredentials(config)
      .includes('skuOptions')
      .find(id)
      .then((s) => {
        setItem &&
          setItem({
            [`${code}`]: s,
          })
      })
      .catch((c) => {
        const errors = getErrorsByCollection(c, 'variant')
        dispatch({
          type: 'setErrors',
          payload: {
            errors,
          },
        })
      })
  }
}

type GetVariantsParams = {
  config: CommerceLayerConfig
  state: VariantState
  skuCode: string
  dispatch: Dispatch<VariantAction>
  filters: object
  setItem: ((item: Items) => void) | undefined
}

export interface GetVariants {
  (params: GetVariantsParams): void
}

export const getVariants: GetVariants = (params) => {
  const { config, state, skuCode, dispatch, setItem, filters } = params
  CLayer.Sku.withCredentials(config)
    .where({ codeIn: state.skuCodes.join(','), ...filters })
    .all()
    .then((r) => {
      const skusObj = getSkus(r.toArray())
      if (skuCode) {
        setSkuCode({
          code: skusObj[skuCode].code,
          id: skusObj[skuCode].id,
          config,
          dispatch,
          setItem,
        })
      }
      dispatch({
        type: 'setVariants',
        payload: {
          variants: skusObj,
        },
      })
      dispatch({
        type: 'setLoading',
        payload: {
          loading: false,
        },
      })
    })
    .catch((c) => {
      const errors = getErrorsByCollection(c, 'variant')
      dispatch({
        type: 'setErrors',
        payload: {
          errors,
        },
      })
    })
}

export const unsetVariantState: UnsetVariantState = (dispatch) => {
  dispatch({
    type: 'setSkuCode',
    payload: { skuCode: '' },
  })
  dispatch({
    type: 'setVariants',
    payload: { variants: {} },
  })
  dispatch({
    type: 'setLoading',
    payload: { loading: false },
  })
}

export const variantInitialState: VariantState = {
  loading: false,
  variants: {},
  skuCodes: [],
  skuCode: '',
  errors: [],
  currentSkuId: '',
  currentSkuInventory: {
    available: false,
    quantity: 0,
    levels: [],
  },
  currentQuantity: 1,
  currentPrices: [],
}

export type VariantActionType =
  | 'setLoading'
  | 'setVariants'
  | 'setSkuCodes'
  | 'setSkuCode'
  | 'setCurrentSkuId'
  | 'setCurrentSkuInventory'
  | 'setCurrentPrices'
  | 'setErrors'

const actionType: VariantActionType[] = [
  'setLoading',
  'setVariants',
  'setSkuCodes',
  'setSkuCode',
  'setCurrentSkuId',
  'setCurrentSkuInventory',
  'setCurrentPrices',
  'setErrors',
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
