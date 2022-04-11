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
  SaveAddressToCustomerAddressBook,
} from '#reducers/OrderReducer'
import CommerceLayerContext from '#context/CommerceLayerContext'
import OrderContext, { defaultOrderContext } from '#context/OrderContext'
import { unsetOrderState, ResourceIncluded } from '#reducers/OrderReducer'
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
    const startRequest = Object.keys(state?.includeLoaded || {}).filter(
      (key) => state?.includeLoaded?.[key as ResourceIncluded] === true
    )
    if (config.accessToken) {
      const localOrder = persistKey ? getLocalOrder(persistKey) : orderId
      if (localOrder) {
        dispatch({
          type: 'setOrderId',
          payload: {
            orderId: localOrder,
          },
        })
        if (!state.order && startRequest.length === state.include?.length) {
          const removeOrderPlaced = !!(persistKey && clearWhenPlaced)
          getApiOrder({
            id: localOrder,
            dispatch,
            config,
            persistKey,
            clearWhenPlaced: removeOrderPlaced,
            deleteLocalOrder,
            state,
          })
        }
      }
    }
    return (): void => unsetOrderState(dispatch)
  }, [config.accessToken, orderId, state.includeLoaded, state.include])
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
      saveAddressToCustomerAddressBook: (
        args: Parameters<SaveAddressToCustomerAddressBook>[0]
      ) =>
        defaultOrderContext['saveAddressToCustomerAddressBook']({
          ...args,
          dispatch,
        }),
      setGiftCardOrCouponCode: ({
        code,
        codeType,
      }: {
        code: string
        codeType: OrderCodeType
      }) =>
        defaultOrderContext['setGiftCardOrCouponCode']({
          code,
          codeType,
          dispatch,
          order: state.order,
          config,
          include: state.include,
          state,
        }),
      removeGiftCardOrCouponCode: ({ codeType }: { codeType: OrderCodeType }) =>
        defaultOrderContext['removeGiftCardOrCouponCode']({
          codeType,
          dispatch,
          order: state.order,
          config,
          include: state.include,
          state,
        }),
      addResourceToInclude: (args: AddResourceToInclude) =>
        defaultOrderContext['addResourceToInclude']({
          ...args,
          dispatch,
          resourcesIncluded: state.include,
          resourceIncludedLoaded: state.includeLoaded,
        }),
      updateOrder: async (args: UpdateOrderArgs) =>
        await defaultOrderContext['updateOrder']({
          ...args,
          dispatch,
          config,
          include: state.include,
          state,
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
