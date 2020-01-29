import { GeneralReducer, GeneralActions } from '../@types/index'
import { OrderCollection } from '@commercelayer/js-sdk'

export interface GetOrder {
  (orderId: string): void
}

export interface AddToCartInterface {
  (skuCode: string, skuId: string, quantity?: number): void
}

export interface OrderState {
  loading: boolean
  orderId: string
  order: OrderCollection
  getOrder?: GetOrder | null
  addToCart?: AddToCartInterface | null
}

export interface OrderActions extends GeneralActions {
  type: 'setLoading' | 'setOrderId' | 'setOrder'
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
  if (action.type === 'setLoading') {
    state = { ...state, loading: action.payload }
  }
  if (action.type === 'setOrderId') {
    state = { ...state, orderId: action.payload }
  }
  if (action.type === 'setOrder') {
    state = { ...state, order: action.payload }
  }
  return state
}

export default orderReducer
