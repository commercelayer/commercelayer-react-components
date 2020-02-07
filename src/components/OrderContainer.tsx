import React, {
  useEffect,
  FunctionComponent,
  useReducer,
  useContext,
  ReactNode
} from 'react'
import { getLocalOrder } from '../utils/localStorage'
import CLayer, { OrderCollection } from '@commercelayer/js-sdk'
import orderReducer, {
  orderInitialState,
  OrderState,
  createOrder
} from '../reducers/OrderReducer'
import CommerceLayerContext from '../context/CommerceLayerContext'
import OrderContext from '../context/OrderContext'
import { getApiOrder } from '../reducers/OrderReducer'
import { AddToCartInterface, unsetOrderState } from '../reducers/OrderReducer'

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
}

const OrderContainer: FunctionComponent<OrderContainerProps> = props => {
  const { children, persistKey } = props
  const [state, dispatch] = useReducer(orderReducer, orderInitialState)
  const config = useContext(CommerceLayerContext)
  console.log('ORDER CONTAINER -- ', config)
  // console.log('--- ORDER ---', state.order)
  const addOrder = (): Promise<string> =>
    createOrder(persistKey, state, dispatch, config)
  const getOrder = (id): void => getApiOrder(id, dispatch, config)
  const addToCart: AddToCartInterface = async (
    skuCode,
    skuId = '',
    quantity = 1
  ) => {
    const id = await addOrder()
    if (id) {
      const order = CLayer.Order.build({ id })
      const attrs = {
        order,
        skuCode,
        quantity,
        // eslint-disable-next-line @typescript-eslint/camelcase
        _update_quantity: 1
      }
      if (skuId) {
        attrs['item'] = CLayer.Sku.build({ id: skuId })
      }
      CLayer.LineItem.withCredentials(config)
        .create(attrs)
        .then(() => getOrder(id))
    }
  }
  useEffect(() => {
    if (config.accessToken) {
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
    return (): void => unsetOrderState(dispatch)
  }, [config.accessToken])
  const orderValue: OrderState = {
    order: state.order,
    orderId: state.orderId,
    loading: state.loading,
    // items: state.items,
    // singleQuantity: state.singleQuantity,
    // currentItem: state.currentItem,
    // setSingleQuantity: (code, quantity) =>
    //   setSingleQuantity(code, quantity, dispatch),
    addToCart,
    getOrder
    // setItems: items => setItems(items, dispatch),
    // setCurrentItem: item => setCurrentItem(item, dispatch)
  }
  return (
    <OrderContext.Provider value={orderValue}>{children}</OrderContext.Provider>
  )
}

export default OrderContainer
