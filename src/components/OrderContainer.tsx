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
import PropTypes, { InferProps } from 'prop-types'
import { BMObject } from '../@types/index'

const OCProps = {
  children: PropTypes.node.isRequired,
  persistKey: PropTypes.string.isRequired,
  metadata: BMObject,
}

export type OrderContainerProps = InferProps<typeof OCProps>

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

OrderContainer.propTypes = OCProps

OrderContainer.defaultProps = {
  metadata: {},
}

OrderContainer.displayName = 'CLOrderContainer'

export default OrderContainer
