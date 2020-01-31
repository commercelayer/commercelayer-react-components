import React, {
  useEffect,
  FunctionComponent,
  useReducer,
  useContext,
  ReactNode
} from 'react'
import { getLocalOrder, setLocalOrder } from '../utils/localStorage'
import { Order, LineItem, Sku, OrderCollection } from '@commercelayer/js-sdk'
import orderReducer, {
  orderInitialState,
  OrderState
} from '../reducers/OrderReducer'
import CommerceLayerContext from './context/CommerceLayerContext'
import OrderContext from './context/OrderContext'
import { SetSingleQuantity } from '../reducers/OrderReducer'
import {
  AddToCartInterface,
  GetOrder,
  CreateOrder
} from '../reducers/OrderReducer'

export interface OrderContainerActions {
  setOrderId?: (orderId: string) => void
  getOrder?: (orderId: string) => void
  orderId?: string
  order?: OrderCollection
}

export interface OrderContainerProps {
  id?: string
  persistKey: string
  children: ReactNode
  accessToken?: string
}
const OrderContainer: FunctionComponent<OrderContainerProps> = props => {
  const { children, persistKey } = props
  const [state, dispatch] = useReducer(orderReducer, orderInitialState)
  const { accessToken } = useContext(CommerceLayerContext)
  console.log('--- ORDER ---', state.order)
  const createOrder: CreateOrder = async () => {
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
  const getOrder: GetOrder = async id => {
    const o = await Order.includes('line_items').find(id)
    if (o)
      dispatch({
        type: 'setOrder',
        payload: {
          order: o
        }
      })
  }
  const setSingleQuantity: SetSingleQuantity = (code, quantity) => {
    const o = {}
    o[code] = Number(quantity)
    dispatch({
      type: 'setSingleQuantity',
      payload: {
        singleQuantity: o
      }
    })
  }
  const addToCart: AddToCartInterface = async (
    skuCode,
    skuId = '',
    quantity = 1
  ) => {
    const id = await createOrder()
    if (id) {
      const order = Order.build({ id })
      const attrs = {
        order,
        skuCode,
        quantity,
        // eslint-disable-next-line @typescript-eslint/camelcase
        _update_quantity: 1
      }
      if (skuId) {
        attrs['item'] = Sku.build({ id: skuId })
      }
      LineItem.create(attrs).then(() => getOrder(id))
    }
  }
  useEffect(() => {
    if (accessToken) {
      const localOrder = getLocalOrder(persistKey)
      if (localOrder) {
        dispatch({
          type: 'setOrderId',
          payload: {
            orderId: localOrder
          }
        })
        if (!state.order) {
          getOrder(localOrder)
        }
      }
    }

    return (): void => {
      dispatch({
        type: 'setOrderId',
        payload: {
          orderId: ''
        }
      })
    }
  }, [accessToken, state.order])
  const orderValue: OrderState = {
    order: state.order,
    orderId: state.orderId,
    loading: state.loading,
    singleQuantity: state.singleQuantity,
    setSingleQuantity,
    addToCart,
    getOrder
  }
  console.log('--- orderValue ---', orderValue)
  return (
    <OrderContext.Provider value={orderValue}>{children}</OrderContext.Provider>
  )
}

export default OrderContainer
