import { GeneralReducer, GeneralActions } from '../@types/index'
import { OrderCollection, Order } from '@commercelayer/js-sdk'
import { Dispatch } from 'react'
import { setLocalOrder } from '../utils/localStorage'

export interface GetOrder {
  (orderId: string, dispacth?: Dispatch<OrderActions>): void
}

export interface CreateOrder {
  (
    persistKey: string,
    state?: OrderState,
    dispatch?: Dispatch<OrderActions>
  ): Promise<string>
}

export interface AddToCartInterface {
  (skuCode: string, skuId?: string, quantity?: number): void
}

export interface SingleQuantity {
  [key: string]: number
}

export interface SetSingleQuantity {
  (
    code: string,
    quantity: number | string,
    dispacth?: Dispatch<OrderActions>
  ): void
}

export const createOrder: CreateOrder = async (persistKey, state, dispatch) => {
  if (state.orderId) return state.orderId
  const o = await Order.create({})
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

export const getApiOrder: GetOrder = async (id, dispatch) => {
  const o = await Order.includes('line_items').find(id)
  if (o)
    dispatch({
      type: 'setOrder',
      payload: {
        order: o
      }
    })
}

export const setSingleQuantity: SetSingleQuantity = (
  code,
  quantity,
  dispatch
) => {
  const o = {}
  o[code] = Number(quantity)
  dispatch({
    type: 'setSingleQuantity',
    payload: {
      singleQuantity: o
    }
  })
}

export interface OrderState {
  loading: boolean
  orderId: string
  order: OrderCollection
  getOrder?: GetOrder | null
  addToCart?: AddToCartInterface | null
  singleQuantity?: SingleQuantity
  setSingleQuantity?: SetSingleQuantity
}

export interface OrderActions extends GeneralActions {
  type: 'setLoading' | 'setOrderId' | 'setOrder' | 'setSingleQuantity'
}

export const orderInitialState: OrderState = {
  loading: false,
  orderId: '',
  order: null
}

const orderReducer: GeneralReducer<OrderState, OrderActions> = (
  state,
  action
) => {
  const actions = [
    'setLoading',
    'setOrderId',
    'setOrder',
    'setSingleQuantity',
    'setCurrentSkuCodes',
    'setCurrentSkuPrices'
  ]
  if (actions.indexOf(action.type)) {
    const data = action.payload
    state = { ...state, ...data }
  }
  return state
}

export default orderReducer
