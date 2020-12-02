import CLayer, { OrderCollection } from '@commercelayer/js-sdk'
import { Dispatch } from 'react'
import { setLocalOrder, deleteLocalOrder } from '../utils/localStorage'
import { CommerceLayerConfig } from '../context/CommerceLayerContext'
import baseReducer from '../utils/baseReducer'
import getErrorsByCollection from '../utils/getErrorsByCollection'
import { ItemOption, CustomLineItem } from './ItemReducer'
import _ from 'lodash'
import { BaseMetadataObject } from '../typings/index'
import { BaseError } from '../typings/errors'

export interface GetOrderParams {
  id: string
  dispatch: Dispatch<OrderActions>
  config: CommerceLayerConfig
  clearWhenPlaced?: boolean
  persistKey?: string
}

export interface GetOrder {
  (params: GetOrderParams): void
}

export interface SetOrderErrors {
  (params: { dispatch: Dispatch<OrderActions>; collection: any }): {
    success: boolean
  }
}

type CreateOrderParams = Pick<
  AddToCartParams,
  | 'config'
  | 'dispatch'
  | 'persistKey'
  | 'state'
  | 'orderMetadata'
  | 'orderAttributes'
>

export interface CreateOrder {
  (params: CreateOrderParams): Promise<string>
}

export interface AddToCartParams {
  skuCode: string
  persistKey: string
  config: CommerceLayerConfig
  dispatch: Dispatch<OrderActions>
  state: Partial<OrderState>
  skuId?: string
  quantity?: number
  option?: ItemOption
  lineItem?: CustomLineItem
  orderMetadata?: BaseMetadataObject
  orderAttributes?: Record<string, any>
  errors?: BaseError[]
}

export type AddToCartReturn = Promise<{
  success: boolean
}>

export interface AddToCart {
  (params: AddToCartParams): AddToCartReturn
}

export interface UnsetOrderState {
  (dispatch: Dispatch<OrderActions>): void
}

export interface OrderPayload {
  loading?: boolean
  orderId?: string
  order?: OrderCollection | null
  errors?: BaseError[]
}

export type AddToCartValues = {
  skuCode: string
  skuId?: string
  quantity?: number
  option?: ItemOption
  lineItem?: CustomLineItem
}

export type getOrderContext = (id: string) => void

export interface OrderState extends OrderPayload {
  loading: boolean
  orderId: string
  order: OrderCollection | null
  getOrder?: getOrderContext
  createOrder?: () => Promise<string>
  addToCart: (values: AddToCartValues) => AddToCartReturn
  setOrderErrors: (collection: any) => { success: boolean }
}

export interface OrderActions {
  type: OrderActionType
  payload: OrderPayload
}

export type OrderActionType =
  | 'setLoading'
  | 'setOrderId'
  | 'setOrder'
  | 'setSingleQuantity'
  | 'setCurrentSkuCodes'
  | 'setCurrentSkuPrices'
  | 'setCurrentItem'
  | 'setErrors'

const actionType: OrderActionType[] = [
  'setLoading',
  'setOrderId',
  'setOrder',
  'setSingleQuantity',
  'setCurrentSkuCodes',
  'setCurrentSkuPrices',
  'setErrors',
  'setCurrentItem',
]

export const createOrder: CreateOrder = async (params) => {
  const {
    persistKey,
    state,
    dispatch,
    config,
    orderMetadata: metadata,
    orderAttributes = {},
  } = params
  if (state.orderId) return state.orderId
  const o = await CLayer.Order.withCredentials(config).create({
    metadata,
    ...orderAttributes,
  })
  if (!o.id) return ''
  dispatch({
    type: 'setOrderId',
    payload: {
      orderId: o.id,
    },
  })
  dispatch({
    type: 'setOrder',
    payload: {
      order: o,
    },
  })
  setLocalOrder(persistKey, o.id)
  return o.id
}

export const getApiOrder: GetOrder = async (params) => {
  const { id, dispatch, config, clearWhenPlaced, persistKey } = params
  try {
    const o = await CLayer.Order.withCredentials(config).find(id)
    if (o)
      if (
        (clearWhenPlaced && o.status === 'placed') ||
        o.status === 'approved' ||
        (o.status === 'cancelled' && persistKey)
      ) {
        deleteLocalOrder(persistKey as string)
        dispatch({
          type: 'setOrder',
          payload: {
            order: null,
          },
        })
      } else {
        dispatch({
          type: 'setOrder',
          payload: {
            order: o,
          },
        })
      }
  } catch (col) {
    // NOTE: Delete orderId if its status is approved
    deleteLocalOrder(persistKey as string)
    dispatch({
      type: 'setOrder',
      payload: {
        order: null,
      },
    })
  }
}

export const addToCart: AddToCart = async (params) => {
  const {
    skuCode,
    skuId,
    quantity,
    option,
    config,
    dispatch,
    lineItem,
    errors,
  } = params
  try {
    const id = await createOrder(params)
    const order = CLayer.Order.build({ id })
    const name = lineItem?.name
    const imageUrl = lineItem?.imageUrl
    const attrs = {
      order,
      skuCode,
      name,
      imageUrl,
      quantity: quantity || 1,
      _updateQuantity: 1,
    }
    if (skuId) {
      attrs['item'] = CLayer.Sku.build({ id: skuId })
    }
    const lineItemResource = await CLayer.LineItem.withCredentials(
      config
    ).create(attrs)
    if (!_.isEmpty(option)) {
      let c = 0
      _.map(option, async (opt) => {
        const { options, skuOptionId } = opt
        const skuOption = CLayer.SkuOption.build({ id: skuOptionId })
        await CLayer.LineItemOption.withCredentials(config).create({
          quantity: 1,
          options,
          lineItem: lineItemResource,
          skuOption,
        })
        c += 1
        if (c === _.size(option)) {
          await getApiOrder({ id, ...params })
        }
      })
    } else {
      await getApiOrder({ id, ...params })
    }
    if (!_.isEmpty(errors)) {
      dispatch({
        type: 'setErrors',
        payload: {
          errors: [],
        },
      })
    }
    return { success: true }
  } catch (col) {
    const errors = getErrorsByCollection(col, 'order')
    dispatch({
      type: 'setErrors',
      payload: {
        errors,
      },
    })
    return { success: false }
  }
}

export const unsetOrderState: UnsetOrderState = (dispatch) => {
  dispatch({
    type: 'setOrderId',
    payload: {
      orderId: '',
    },
  })
  dispatch({
    type: 'setOrder',
    payload: {
      order: null,
    },
  })
}

export const setOrderErrors: SetOrderErrors = ({ dispatch, collection }) => {
  const errors = getErrorsByCollection(collection, 'order')
  dispatch({
    type: 'setErrors',
    payload: {
      errors,
    },
  })
  return { success: false }
}

export const orderInitialState: Partial<OrderState> = {
  loading: false,
  orderId: '',
  order: null,
  errors: [],
}

const orderReducer = (
  state: Partial<OrderState>,
  reducer: OrderActions
): Partial<OrderState> =>
  baseReducer<Partial<OrderState>, OrderActions, OrderActionType[]>(
    state,
    reducer,
    actionType
  )

export default orderReducer
