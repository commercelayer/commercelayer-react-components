import { Sku } from '@commercelayer/sdk'
import { VariantOption } from '#components/VariantSelector'
import { Dispatch } from 'react'
import baseReducer from '#utils/baseReducer'
import getSkus from '#utils/getSkus'
import { CommerceLayerConfig } from '#context/CommerceLayerContext'
import { Items, CustomLineItem, SetCustomLineItems } from './ItemReducer'
import { BaseError } from '#typings/errors'
import { isEmpty, has } from 'lodash'
import getSdk from '#utils/getSdk'
import { SkuInventory } from './AvailabilityReducer'

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
  skuCodes: VariantOption[]
  dispatch: Dispatch<VariantAction>
  setCustomLineItems?: SetCustomLineItems
}

export interface SetVariantSkuCodes {
  (params: SetVariantSkuCodesParams): void
}

export interface VariantsObject {
  [key: string]: Sku
}

export type SetSkuCode = (
  code: string,
  id: string,
  lineItem?: CustomLineItem
) => void

export interface VariantPayload {
  loading?: boolean
  variants?: VariantsObject | Record<string, any>
  skuCodes?: string[]
  skuCode?: string
  errors?: BaseError[]
  currentSkuId?: string
  currentSkuInventory?: any
  currentQuantity?: number
  currentPrices?: Sku[]
  setSkuCode?: SetSkuCode
  setSkuCodes?: (skuCodes: VariantOption[]) => void
}

export interface VariantState extends VariantPayload {
  skuCodes: string[]
  variants: VariantsObject | Record<string, any>
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
  const lineItems: any = {}
  const sCodes = skuCodes.map((s) => {
    if (has(s, 'lineItem')) {
      lineItems[s.code] = s.lineItem
    }
    return s.code
  })
  if (!isEmpty(lineItems)) {
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
    const sdk = getSdk(config)
    sdk.skus
      .retrieve(id, { include: ['sku_options'] })
      .then((sku) => {
        setItem &&
          setItem({
            [`${code}`]: sku as SkuInventory,
          })
      })
      .catch((errors) => {
        debugger
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
  filters: Record<string, any>
  setItem: ((item: Items) => void) | undefined
}

export interface GetVariants {
  (params: GetVariantsParams): void
}

export const getVariants: GetVariants = (params) => {
  const { config, state, skuCode, dispatch, setItem, filters } = params
  const sdk = getSdk(config)
  sdk.skus
    .list({
      filters: {
        code_in: state.skuCodes.join(','),
        ...filters,
      },
    })
    .then((skus) => {
      const skusObj = getSkus(skus, state.skuCodes)
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
    .catch((errors) => {
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
