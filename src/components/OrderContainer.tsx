import React, {
  useEffect,
  FunctionComponent,
  useReducer,
  useContext,
  ReactNode,
} from 'react'
import { getLocalOrder } from '../utils/localStorage'
import orderReducer, {
  orderInitialState,
  AddToCartValues,
  createOrder,
} from '../reducers/OrderReducer'
import CommerceLayerContext from '../context/CommerceLayerContext'
import OrderContext from '../context/OrderContext'
import {
  getApiOrder,
  addToCart,
  OrderState,
  setOrderErrors,
} from '../reducers/OrderReducer'
import { unsetOrderState } from '../reducers/OrderReducer'
import components from '../config/components'
import { BaseMetadataObject } from '../typings'

const propTypes = components.OrderContainer.propTypes
const defaultProps = components.OrderContainer.defaultProps
const displayName = components.OrderContainer.displayName

type OrderContainerProps = {
  children: ReactNode
  persistKey: string
  clearWhenPlaced?: boolean
  metadata?: BaseMetadataObject
  attributes?: Record<string, any>
}

const OrderContainer: FunctionComponent<OrderContainerProps> = (props) => {
  const {
    children,
    persistKey,
    metadata,
    clearWhenPlaced = true,
    attributes,
  } = props
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
          getApiOrder({
            id: localOrder,
            dispatch,
            config,
            persistKey,
            clearWhenPlaced,
          })
        }
      }
    }
    return (): void => unsetOrderState(dispatch)
  }, [config.accessToken])
  const orderValue = {
    ...state,
    createOrder: async (): Promise<string> =>
      await createOrder({
        persistKey,
        dispatch,
        config,
        state,
        orderMetadata: metadata,
        orderAttributes: attributes,
      }),
    addToCart: (values: AddToCartValues): Promise<{ success: boolean }> =>
      addToCart({
        ...values,
        persistKey,
        dispatch,
        state,
        config,
        errors: state.errors,
        orderMetadata: metadata || {},
        orderAttributes: attributes,
      }),
    getOrder: (id: string): void => getApiOrder({ id, dispatch, config }),
    setOrderErrors: (collection: any) =>
      setOrderErrors({ dispatch, collection }),
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
