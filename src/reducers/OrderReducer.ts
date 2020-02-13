import CLayer, { OrderCollection } from '@commercelayer/js-sdk'
import { Dispatch } from 'react'
import { setLocalOrder } from '../utils/localStorage'
import { CommerceLayerConfig } from '../context/CommerceLayerContext'
import baseReducer from '../utils/baseReducer'

export interface GetOrder {
  (
    orderId: string,
    dispacth?: Dispatch<OrderActions>,
    config?: CommerceLayerConfig
  ): void
}

export interface CreateOrder {
  (
    persistKey: string,
    state?: OrderState,
    dispatch?: Dispatch<OrderActions>,
    config?: CommerceLayerConfig
  ): Promise<string>
}

export interface AddToCartInterface {
  (skuCode: string, skuId?: string, quantity?: number): void
}

export const createOrder: CreateOrder = async (
  persistKey,
  state,
  dispatch,
  config
) => {
  if (state.orderId) return state.orderId
  const o = await CLayer.Order.withCredentials(config).create({})
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

export const getApiOrder: GetOrder = async (id, dispatch, config) => {
  const o = await CLayer.Order.withCredentials(config)
    .includes('line_items')
    .find(id)
  if (o)
    dispatch({
      type: 'setOrder',
      payload: {
        order: o
      }
    })
}

export interface UnsetOrderState {
  (dispatch: Dispatch<OrderActions>)
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

export interface OrderPayload {
  loading?: boolean
  orderId?: string
  order?: OrderCollection
  getOrder?: GetOrder | null
  addToCart?: AddToCartInterface | null
}

export interface OrderState extends OrderPayload {
  loading: boolean
  orderId: string
  order: OrderCollection
}

export interface OrderActions {
  type: OrderActionType
  payload: OrderPayload
}

export const orderInitialState: OrderState = {
  loading: false,
  orderId: '',
  order: null
}

export type OrderActionType =
  | 'setLoading'
  | 'setOrderId'
  | 'setOrder'
  | 'setSingleQuantity'
  | 'setCurrentSkuCodes'
  | 'setCurrentSkuPrices'
  | 'setCurrentItem'

const actionType: OrderActionType[] = [
  'setLoading',
  'setOrderId',
  'setOrder',
  'setSingleQuantity',
  'setCurrentSkuCodes',
  'setCurrentSkuPrices',
  'setCurrentItem'
]

const orderReducer = (state: OrderState, reducer: OrderActions): OrderState =>
  baseReducer<OrderState, OrderActions, OrderActionType[]>(
    state,
    reducer,
    actionType
  )

export default orderReducer
