import React, {
  useEffect,
  FunctionComponent,
  useReducer,
  useContext,
  ReactNode
} from 'react'
import { getLocalOrder } from '../utils/localStorage'
import { Order, LineItem, Sku, OrderCollection } from '@commercelayer/js-sdk'
import orderReducer, {
  orderInitialState,
  OrderState,
  createOrder
} from '../reducers/OrderReducer'
import CommerceLayerContext from './context/CommerceLayerContext'
import OrderContext from './context/OrderContext'
import { getApiOrder, setSingleQuantity } from '../reducers/OrderReducer'
import { AddToCartInterface } from '../reducers/OrderReducer'

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
  // console.log('--- ORDER ---', state.order)
  const addOrder = (): Promise<string> =>
    createOrder(persistKey, state, dispatch)
  const getOrder = (id): void => getApiOrder(id, dispatch)
  const addToCart: AddToCartInterface = async (
    skuCode,
    skuId = '',
    quantity = 1
  ) => {
    const id = await addOrder()
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
    setSingleQuantity: (code, quantity) =>
      setSingleQuantity(code, quantity, dispatch),
    addToCart,
    getOrder
  }
  console.log('--- orderValue ---', orderValue)
  return (
    <OrderContext.Provider value={orderValue}>{children}</OrderContext.Provider>
  )
}

export default OrderContainer
