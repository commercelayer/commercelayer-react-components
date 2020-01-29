import React, {
  useEffect,
  FunctionComponent,
  useReducer,
  useContext
} from 'react'
import Parent from './utils/Parent'
import { getLocalOrder, setLocalOrder } from '../utils/localStorage'
import { Order, LineItem, Sku, OrderCollection } from '@commercelayer/js-sdk'
import orderReducer, { orderInitialState } from '../reducers/OrderReducer'
import CommerceLayerContext from './context/CommerceLayerContext'
import OrderContext from './context/OrderContext'
import { addToCartInterface, getOrderInterface } from '../reducers/OrderReducer'

export interface OrderContainerActions {
  setOrderId?: (orderId: string) => void
  getOrder?: (orderId: string) => void
  orderId?: string
  order?: OrderCollection
}

export interface OrderContainerProps {
  id?: string
  persistKey: string
  children: any
  accessToken?: string
}
const OrderContainer: FunctionComponent<OrderContainerProps> = props => {
  const { children, persistKey } = props
  const [state, dispatch] = useReducer(orderReducer, orderInitialState)
  const { accessToken } = useContext(CommerceLayerContext)
  console.log('--- ORDER ---', state.order)
  const createOrder = async () => {
    if (state.orderId) return state.orderId
    const o = await Order.create({})
    if (o.id) {
      dispatch({
        type: 'setOrderId',
        payload: o.id
      })
      dispatch({
        type: 'setOrder',
        payload: o
      })
      setLocalOrder(persistKey, o.id)
      return o.id
    }
  }
  const getOrder: getOrderInterface = async id => {
    const o = await Order.includes('line_items').find(id)
    if (o)
      dispatch({
        type: 'setOrder',
        payload: o
      })
  }
  const addToCart: addToCartInterface = async (
    skuCode,
    skuId,
    quantity = 1
  ) => {
    const id = await createOrder()
    if (id) {
      const order = Order.build({ id })
      const item = Sku.build({ id: skuId })
      const attrs = {
        order,
        item,
        skuCode,
        quantity,
        _update_quantity: 1
      }
      LineItem.create(attrs).then(() => getOrder(id))
    }
  }
  // const parentProps = {
  //   orderId: state.orderId,
  //   order: state.order,
  //   addToCart,
  //   getOrder,
  //   ...props
  // }
  useEffect(() => {
    if (accessToken) {
      const localOrder = getLocalOrder(persistKey)
      if (localOrder) {
        dispatch({
          type: 'setOrderId',
          payload: localOrder
        })
        if (!state.order) {
          getOrder(localOrder)
        }
      }
    }

    return () => {
      dispatch({
        type: 'setOrderId',
        payload: ''
      })
    }
  }, [accessToken, state.order])
  const orderValue = {
    order: state.order,
    orderId: state.orderId,
    loading: state.loading,
    addToCart,
    getOrder
  }
  return (
    <OrderContext.Provider value={orderValue}>{children}</OrderContext.Provider>
  )
}

export default OrderContainer
