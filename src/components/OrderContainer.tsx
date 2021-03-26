import React, {
  useEffect,
  FunctionComponent,
  useReducer,
  useContext,
  ReactNode,
} from 'react'
import orderReducer, {
  orderInitialState,
  AddToCartValues,
  createOrder,
  removeGiftCardOrCouponCode,
} from '#reducers/OrderReducer'
import CommerceLayerContext from '#context/CommerceLayerContext'
import OrderContext from '#context/OrderContext'
import {
  getApiOrder,
  addToCart,
  OrderState,
  setOrderErrors,
  saveAddressToCustomerBook,
  setOrder,
} from '#reducers/OrderReducer'
import { unsetOrderState } from '#reducers/OrderReducer'
import components from '#config/components'
import { BaseMetadataObject } from '#typings'
import OrderStorageContext from '#context/OrderStorageContext'
import { OrderCollection } from '@commercelayer/js-sdk'
import {
  setGiftCardOrCouponCode,
  OrderCodeType,
} from '../reducers/OrderReducer'

const propTypes = components.OrderContainer.propTypes
const defaultProps = components.OrderContainer.defaultProps
const displayName = components.OrderContainer.displayName

type OrderContainerProps = {
  children: ReactNode
  metadata?: BaseMetadataObject
  attributes?: Record<string, any>
  orderId?: string
}

const OrderContainer: FunctionComponent<OrderContainerProps> = (props) => {
  const { orderId, children, metadata, attributes } = props
  const [state, dispatch] = useReducer(orderReducer, orderInitialState)
  const config = useContext(CommerceLayerContext)
  const {
    persistKey,
    clearWhenPlaced,
    getLocalOrder,
    setLocalOrder,
    deleteLocalOrder,
  } = useContext(OrderStorageContext)
  useEffect(() => {
    if (config.accessToken) {
      const localOrder = persistKey ? getLocalOrder(persistKey) : orderId
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
            deleteLocalOrder,
          })
        }
      }
    }
    return (): void => unsetOrderState(dispatch)
  }, [config.accessToken])
  const orderValue = {
    ...state,
    setOrder: (order: OrderCollection) => setOrder(order, dispatch),
    getOrder: (id: string): Promise<void | OrderCollection> =>
      getApiOrder({ id, dispatch, config }),
    setOrderErrors: (collection: any) =>
      setOrderErrors({ dispatch, collection }),
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
        setLocalOrder,
      }),
    saveAddressToCustomerBook: (
      type: 'BillingAddress' | 'ShippingAddress',
      value: boolean
    ) => saveAddressToCustomerBook({ type, value, dispatch }),
    setGiftCardOrCouponCode: ({ code }: { code: string }) =>
      setGiftCardOrCouponCode({ code, dispatch, order: state.order, config }),
    removeGiftCardOrCouponCode: ({ codeType }: { codeType: OrderCodeType }) =>
      removeGiftCardOrCouponCode({
        codeType,
        dispatch,
        order: state.order,
        config,
      }),
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
