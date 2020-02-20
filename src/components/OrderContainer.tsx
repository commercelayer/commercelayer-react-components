import React, {
  useEffect,
  FunctionComponent,
  useReducer,
  useContext,
  ReactNode
} from 'react'
import { getLocalOrder } from '../utils/localStorage'
import orderReducer, {
  orderInitialState,
  OrderState
} from '../reducers/OrderReducer'
import CommerceLayerContext from '../context/CommerceLayerContext'
import OrderContext from '../context/OrderContext'
import { getApiOrder, addToCart } from '../reducers/OrderReducer'
import { unsetOrderState } from '../reducers/OrderReducer'
import { OrderCollection } from '@commercelayer/js-sdk'

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
          getApiOrder({ id: localOrder, dispatch, config })
        }
      }
    }
    return (): void => unsetOrderState(dispatch)
  }, [config.accessToken])
  const orderValue: OrderState = {
    order: state.order,
    orderId: state.orderId,
    loading: state.loading,
    addToCart: values =>
      addToCart({ ...values, persistKey, dispatch, state, config }),
    getOrder: id => getApiOrder({ id, dispatch, config })
  }
  return (
    <OrderContext.Provider value={orderValue}>{children}</OrderContext.Provider>
  )
}

export default OrderContainer
