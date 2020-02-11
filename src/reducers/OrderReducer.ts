import { BaseReducer, BaseAction } from '../@types/index'
import CLayer, {
  OrderCollection
  // Order,
  // SkuCollection
} from '@commercelayer/js-sdk'
import { Dispatch } from 'react'
import { setLocalOrder } from '../utils/localStorage'
import { CommerceLayerConfig } from '../context/CommerceLayerContext'

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

// export interface SingleQuantity {
//   [key: string]: number
// }

// export interface SetSingleQuantity {
//   (
//     code: string,
//     quantity: number | string,
//     dispacth?: Dispatch<OrderActions>
//   ): void
// }

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

// export const setSingleQuantity: SetSingleQuantity = (
//   code,
//   quantity,
//   dispatch
// ) => {
//   const o = {}
//   o[code] = Number(quantity)
//   dispatch({
//     type: 'setSingleQuantity',
//     payload: {
//       singleQuantity: o
//     }
//   })
// }

// export interface Items {
//   [skuCode: string]: SkuCollection
// }

// export interface SetItems {
//   (items: Items, dispatch: Dispatch<OrderActions>)
// }

// export const setItems: SetItems = (items, dispatch) => {
//   dispatch({
//     type: 'setItems',
//     payload: {
//       items
//     }
//   })
// }

// export const setCurrentItem: SetItems = (currentItem, dispatch) => {
//   dispatch({
//     type: 'setItems',
//     payload: {
//       currentItem
//     }
//   })
// }

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

export interface OrderState {
  loading: boolean
  orderId: string
  order: OrderCollection
  // items: Items
  // currentItem?: Items
  getOrder?: GetOrder | null
  addToCart?: AddToCartInterface | null
  // singleQuantity?: SingleQuantity
  // setSingleQuantity?: SetSingleQuantity
  // setItems?: (items: Items) => SetItems
  // setCurrentItem?: (items: Items) => SetItems
}

export interface OrderActions extends BaseAction {
  type:
    | 'setLoading'
    | 'setOrderId'
    | 'setOrder'
    | 'setSingleQuantity'
    // | 'setItems'
    | 'setCurrentItem'
}

export const orderInitialState: OrderState = {
  loading: false,
  orderId: '',
  order: null
  // items: {}
}

const orderReducer: BaseReducer<OrderState, OrderActions> = (state, action) => {
  const actions = [
    'setLoading',
    'setOrderId',
    'setOrder',
    'setSingleQuantity',
    'setCurrentSkuCodes',
    'setCurrentSkuPrices',
    // 'setItems',
    'setCurrentItem'
  ]
  if (actions.indexOf(action.type) !== -1) {
    const data = action.payload
    state = { ...state, ...data }
  }
  return state
}

export default orderReducer
