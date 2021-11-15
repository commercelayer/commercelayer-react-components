import React, {
  useEffect,
  FunctionComponent,
  useReducer,
  useContext,
  ReactNode,
  useMemo,
} from 'react'
import orderReducer, {
  AddToCartValues,
  createOrder,
  getApiOrder,
  setOrderErrors,
  setOrder,
  OrderCodeType,
  AddResourceToInclude,
  orderInitialState,
  UpdateOrderArgs,
} from '#reducers/OrderReducer'
import CommerceLayerContext from '#context/CommerceLayerContext'
import OrderContext, { defaultOrderContext } from '#context/OrderContext'
import { unsetOrderState } from '#reducers/OrderReducer'
import components from '#config/components'
import { BaseMetadataObject } from '#typings'
import OrderStorageContext from '#context/OrderStorageContext'
import { OrderCreate, Order } from '@commercelayer/sdk'

const propTypes = components.OrderContainer.propTypes
const defaultProps = components.OrderContainer.defaultProps
const displayName = components.OrderContainer.displayName

type OrderContainerProps = {
  children: ReactNode
  metadata?: BaseMetadataObject
  attributes?: OrderCreate
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
            state,
          })
        }
      }
    }
    return (): void => unsetOrderState(dispatch)
  }, [config.accessToken])
  const orderValue = useMemo(() => {
    return {
      ...state,
      setOrder: (order: Order) => setOrder(order, dispatch),
      getOrder: (id: string): Promise<void | Order> =>
        getApiOrder({ id, dispatch, config, state }),
      setOrderErrors: (errors: any) => setOrderErrors({ dispatch, errors }),
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
        defaultOrderContext['addToCart']({
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
      saveAddressToCustomerAddressBook: (args: any) =>
        defaultOrderContext['saveAddressToCustomerAddressBook']({
          ...args,
          dispatch,
        }),
      setGiftCardOrCouponCode: ({ code }: { code: string }) =>
        defaultOrderContext['setGiftCardOrCouponCode']({
          code,
          dispatch,
          order: state.order,
          config,
        }),
      removeGiftCardOrCouponCode: ({ codeType }: { codeType: OrderCodeType }) =>
        defaultOrderContext['removeGiftCardOrCouponCode']({
          codeType,
          dispatch,
          order: state.order,
          config,
        }),
      addResourceToInclude: (args: AddResourceToInclude) =>
        defaultOrderContext['addResourceToInclude']({
          ...args,
          dispatch,
          resourcesIncluded: state.include,
        }),
      updateOrder: async (args: UpdateOrderArgs) =>
        await defaultOrderContext['updateOrder']({
          ...args,
          dispatch,
          config,
          include: state.include,
        }),
    }
  }, [state])
  return (
    <OrderContext.Provider value={orderValue}>{children}</OrderContext.Provider>
  )
}

OrderContainer.propTypes = propTypes
OrderContainer.defaultProps = defaultProps
OrderContainer.displayName = displayName

export default OrderContainer
