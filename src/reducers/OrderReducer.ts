import { GeneralReducer, GeneralActions } from '../@types/index'
import { OrderCollection } from '@commercelayer/js-sdk'
import _ from 'cypress/types/lodash'

export interface GetOrder {
  (orderId: string): void
}

export interface CreateOrder {
  (): Promise<string>
}

export interface AddToCartInterface {
  (skuCode: string, skuId?: string, quantity?: number): void
}

export interface SingleQuantity {
  [key: string]: number
}

export interface SetSingleQuantity {
  (code: string, quantity: number | string): void
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
  const actions = ['setLoading', 'setOrderId', 'setOrder', 'setSingleQuantity']
  if (actions.indexOf(action.type)) {
    const data = action.payload
    state = { ...state, ...data }
  }
  return state
}

export default orderReducer
