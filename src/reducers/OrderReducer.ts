import CLayer, { OrderCollection } from '@commercelayer/js-sdk'
import { Dispatch } from 'react'
import { setLocalOrder } from '../utils/localStorage'
import { CommerceLayerConfig } from '../context/CommerceLayerContext'
import baseReducer from '../utils/baseReducer'
import { BaseError } from '../components/Errors'
import getErrorsByCollection from '../utils/getErrorsByCollection'
import { ItemOption } from './ItemReducer'
import _ from 'lodash'
import { BaseMetadataObject } from '../@types/index'

export interface GetOrderParams {
  id: string
  dispatch?: Dispatch<OrderActions>
  config?: CommerceLayerConfig
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
  order?: OrderCollection
  errors?: BaseError[]
}

type AddToCartValues = {
  skuCode: string
  skuId?: string
  quantity?: number
  option?: ItemOption
}

export type getOrderContext = (id: string) => void

export interface OrderState extends OrderPayload {
  loading: boolean
  orderId: string
  order: OrderCollection
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
  'setCurrentItem'
]

export const createOrder: CreateOrder = async params => {
  const {
    persistKey,
    state,
    dispatch,
    config,
    orderMetadata: metadata
  } = params
  if (state.orderId) return state.orderId
  const o = await CLayer.Order.withCredentials(config).create({ metadata })
  if (o.id) {
    dispatch({
      type: 'setOrderId',
      payload: {
        orderId: o.id
      }
    })
    dispatch({
      type: 'setOrder',
      payload: {
        order: o
      }
    })
    setLocalOrder(persistKey, o.id)
    return o.id
  }
}

export const getApiOrder: GetOrder = async params => {
  const { id, dispatch, config } = params
  const o = await CLayer.Order.withCredentials(config)
    .includes('lineItems.lineItemOptions')
    .find(id)
  if (o)
    dispatch({
      type: 'setOrder',
      payload: {
        order: o
      }
    })
}

export const addToCart: AddToCart = async params => {
  const { skuCode, skuId, quantity, option, config, dispatch } = params
  try {
    const id = await createOrder(params)
    const order = CLayer.Order.build({ id })
    const attrs = {
      order,
      skuCode,
      quantity: quantity || 1,
      _updateQuantity: 1
    }
    if (skuId) {
      attrs['item'] = CLayer.Sku.build({ id: skuId })
    }
    const lineItem = await CLayer.LineItem.withCredentials(config).create(attrs)
    if (!_.isEmpty(option)) {
      const { options, skuOptionId } = option
      const skuOption = CLayer.SkuOption.build({ id: skuOptionId })
      await CLayer.LineItemOption.withCredentials(config).create({
        quantity: 1,
        options,
        lineItem,
        skuOption
      })
    }
    await getApiOrder({ id, ...params })
  } catch (col) {
    const errors = getErrorsByCollection(col, 'order')
    dispatch({
      type: 'setErrors',
      payload: {
        errors
      }
    })
  }
}

export const unsetOrderState: UnsetOrderState = dispatch => {
  dispatch({
    type: 'setOrderId',
    payload: {
      orderId: ''
    }
  })
  dispatch({
    type: 'setOrder',
    payload: {
      order: null
    }
  })
}

export const orderInitialState: OrderState = {
  loading: false,
  orderId: '',
  order: null,
  errors: []
}

const orderReducer = (state: OrderState, reducer: OrderActions): OrderState =>
  baseReducer<OrderState, OrderActions, OrderActionType[]>(
    state,
    reducer,
    actionType
  )

export default orderReducer
