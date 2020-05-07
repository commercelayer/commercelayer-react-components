import CLayer, { OrderCollection } from '@commercelayer/js-sdk'
import { Dispatch } from 'react'
import { setLocalOrder } from '../utils/localStorage'
import { CommerceLayerConfig } from '../context/CommerceLayerContext'
import baseReducer from '../utils/baseReducer'
import getErrorsByCollection from '../utils/getErrorsByCollection'
import { ItemOption, CustomLineItem } from './ItemReducer'
import _ from 'lodash'
import { BaseMetadataObject } from '../@types/index'
import { BaseError } from '../@types/errors'

export interface GetOrderParams {
  id: string
  dispatch: Dispatch<OrderActions>
  config: CommerceLayerConfig
}

export interface GetOrder {
  (params: GetOrderParams): void
}

export interface CreateOrder {
  (params: AddToCartParams): Promise<string>
}

export interface AddToCartParams {
  skuCode: string
  persistKey: string
  config: CommerceLayerConfig
  dispatch: Dispatch<OrderActions>
  state: OrderState
  skuId?: string
  quantity?: number
  option?: ItemOption
  lineItem?: CustomLineItem
  orderMetadata?: BaseMetadataObject
}

export interface AddToCart {
  (params: AddToCartParams): void
}

export interface UnsetOrderState {
  (dispatch: Dispatch<OrderActions>)
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
  addToCart?: (values: AddToCartValues) => void
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
  } = params
  if (state.orderId) return state.orderId
  const o = await CLayer.Order.withCredentials(config).create({ metadata })
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
  const { id, dispatch, config } = params
  const o = await CLayer.Order.withCredentials(config).find(id)
  if (o)
    dispatch({
      type: 'setOrder',
      payload: {
        order: o,
      },
    })
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
      _.map(option, async (opt) => {
        const { options, skuOptionId } = opt
        const skuOption = CLayer.SkuOption.build({ id: skuOptionId })
        await CLayer.LineItemOption.withCredentials(config).create({
          quantity: 1,
          options,
          lineItem: lineItemResource,
          skuOption,
        })
      })
    }
    await getApiOrder({ id, ...params })
  } catch (col) {
    const errors = getErrorsByCollection(col, 'order')
    dispatch({
      type: 'setErrors',
      payload: {
        errors,
      },
    })
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

export const orderInitialState: OrderState = {
  loading: false,
  orderId: '',
  order: null,
  errors: [],
}

const orderReducer = (state: OrderState, reducer: OrderActions): OrderState =>
  baseReducer<OrderState, OrderActions, OrderActionType[]>(
    state,
    reducer,
    actionType
  )

export default orderReducer
