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
import PropTypes from 'prop-types'

export interface OrderContainerProps {
  id?: string // TODO to valuate
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
    ...state,
    addToCart: values =>
      addToCart({ ...values, persistKey, dispatch, state, config }),
    getOrder: id => getApiOrder({ id, dispatch, config })
  }
  return (
    <OrderContext.Provider value={orderValue}>{children}</OrderContext.Provider>
  )
}

OrderContainer.propTypes = {
  children: PropTypes.node,
  persistKey: PropTypes.string.isRequired
}

export default OrderContainer
