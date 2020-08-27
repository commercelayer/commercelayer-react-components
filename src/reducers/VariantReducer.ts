import CLayer, {
  SkuCollection,
  InventoryCollection,
} from '@commercelayer/js-sdk'
import { VariantOptions } from '../components/VariantSelector'
import { Dispatch } from 'react'
import baseReducer from '../utils/baseReducer'
import getErrorsByCollection from '../utils/getErrorsByCollection'
import getSkus from '../utils/getSkus'
import { CommerceLayerConfig } from '../context/CommerceLayerContext'
import { Items, CustomLineItem, SetCustomLineItems } from './ItemReducer'
import { BaseError } from '../typings/errors'
import _ from 'lodash'

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

type SetVariantSkuCodesParams = {
  skuCodes: VariantOptions[]
  dispatch: Dispatch<VariantAction>
  setCustomLineItems?: SetCustomLineItems
}

export interface SetVariantSkuCodes {
  (params: SetVariantSkuCodesParams): void
}

export interface VariantsObject {
  [key: string]: SkuCollection
}

export type SetSkuCode = (
  code: string,
  id: string,
  lineItem?: CustomLineItem
) => void

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
  setSkuCode?: SetSkuCode
  setSkuCodes?: (skuCodes: VariantOptions[]) => void
}

export interface VariantState extends VariantPayload {
  skuCodes: string[]
  variants: VariantsObject | object
}

export interface VariantAction {
  type: VariantActionType
  payload: VariantPayload
}

export const setVariantSkuCodes: SetVariantSkuCodes = ({
  skuCodes,
  dispatch,
  setCustomLineItems,
}) => {
  const lineItems = {}
  const sCodes = skuCodes.map((s) => {
    if (_.has(s, 'lineItem')) {
      lineItems[s.code] = s.lineItem
    }
    return s.code
  })
  if (!_.isEmpty(lineItems)) {
    setCustomLineItems && setCustomLineItems(lineItems)
  }
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
