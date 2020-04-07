import React, {
  useEffect,
  FunctionComponent,
  useReducer,
  useContext,
} from 'react'
import { getLocalOrder } from '../utils/localStorage'
import orderReducer, {
  orderInitialState,
  AddToCartValues,
} from '../reducers/OrderReducer'
import CommerceLayerContext from '../context/CommerceLayerContext'
import OrderContext from '../context/OrderContext'
import { getApiOrder, addToCart, OrderState } from '../reducers/OrderReducer'
import { unsetOrderState } from '../reducers/OrderReducer'
import { PropsType } from '../utils/PropsType'
import components from '../config/components'

const propTypes = components.OrderContainer.propTypes
const defaultProps = components.OrderContainer.defaultProps
const displayName = components.OrderContainer.displayName

export type OrderContainerProps = PropsType<typeof propTypes>

const OrderContainer: FunctionComponent<OrderContainerProps> = (props) => {
  const { children, persistKey, metadata } = props
  const [state, dispatch] = useReducer(orderReducer, orderInitialState)
  const config = useContext(CommerceLayerContext)
  useEffect(() => {
    if (config.accessToken) {
      const localOrder = getLocalOrder(persistKey)
      if (localOrder) {
        dispatch({
          type: 'setOrderId',
          payload: {
            orderId: localOrder,
          },
        })
        if (!state.order) {
          getApiOrder({ id: localOrder, dispatch, config })
        }
      }
    }
    return (): void => unsetOrderState(dispatch)
  }, [config.accessToken])
  const orderValue = {
    ...state,
    addToCart: (values: AddToCartValues): void =>
      addToCart({
        ...values,
        persistKey,
        dispatch,
        state,
        config,
        orderMetadata: metadata || {},
      }),
    getOrder: (id: string): void => getApiOrder({ id, dispatch, config }),
  }
  return (
    <OrderContext.Provider value={orderValue as OrderState}>
      {children}
    </OrderContext.Provider>
  )
}

OrderContainer.propTypes = propTypes
OrderContainer.defaultProps = defaultProps
OrderContainer.displayName = displayName

export default OrderContainer
