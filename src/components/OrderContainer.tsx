import { useEffect, useReducer, useContext, ReactNode, useMemo } from 'react'
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
  updateOrder,
} from '#reducers/OrderReducer'
import CommerceLayerContext from '#context/CommerceLayerContext'
import OrderContext, { defaultOrderContext } from '#context/OrderContext'
import { ResourceIncluded } from '#reducers/OrderReducer'
import components from '#config/components'
import { BaseMetadataObject } from '#typings'
import OrderStorageContext from '#context/OrderStorageContext'
import { OrderCreate, Order } from '@commercelayer/sdk'
import { BaseError } from '#typings/errors'
import compareObjAttribute from '#utils/compareObjAttribute'

const propTypes = components.OrderContainer.propTypes
const defaultProps = components.OrderContainer.defaultProps
const displayName = components.OrderContainer.displayName

type OrderContainerProps = {
  children: ReactNode
  metadata?: BaseMetadataObject
  attributes?: OrderCreate
  orderId?: string
  fetchOrder?: (order: Order) => void
}

const OrderContainer: React.FunctionComponent<OrderContainerProps> = (
  props
) => {
  const { orderId, children, metadata, attributes, fetchOrder } = props
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
    if (config.accessToken && !state.loading) {
      const localOrder = persistKey ? getLocalOrder(persistKey) : orderId
      if (
        localOrder &&
        !state.order &&
        state.include?.length === startRequest.length
      ) {
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
      } else if (state?.order) {
        fetchOrder && fetchOrder(state.order)
      }
    }
    return () => {
      if (!state.order && state.loading) {
        if (state.include?.length === 0 && startRequest.length > 0) {
          dispatch({
            type: 'setLoading',
            payload: {
              loading: false,
            },
          })
        } else {
          dispatch({
            type: 'setIncludesResource',
            payload: {
              include: [],
            },
          })
        }
      }
    }
  }, [
    config.accessToken,
    state.includeLoaded,
    state.include,
    orderId,
    state.order,
    state.loading,
  ])
  useEffect(() => {
    if (state.orderId && attributes && state.order) {
      const updateAttributes = compareObjAttribute({
        attributes: attributes,
        object: state.order,
      })
      if (Object.keys(updateAttributes).length > 0) {
        updateOrder({
          id: state.orderId,
          attributes: updateAttributes,
          dispatch,
          config,
          include: state.include,
          state,
        })
      }
    }
  }, [attributes, state.orderId, state.order])

  const orderValue = useMemo(() => {
    return {
      ...state,
      setOrder: (order: Order) => setOrder(order, dispatch),
      getOrder: (id: string): Promise<void | Order> =>
        getApiOrder({ id, dispatch, config, state }),
      setOrderErrors: (errors: BaseError[]) =>
        setOrderErrors({ dispatch, errors }),
      createOrder: (): Promise<string> =>
        createOrder({
          persistKey,
          dispatch,
          config,
          state,
          orderMetadata: metadata,
          orderAttributes: attributes,
          setLocalOrder,
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
  }, [state, config.accessToken])
  return (
    <OrderContext.Provider value={orderValue}>{children}</OrderContext.Provider>
  )
}

OrderContainer.propTypes = propTypes
OrderContainer.defaultProps = defaultProps
OrderContainer.displayName = displayName

export default OrderContainer
