import {
  useEffect,
  useReducer,
  useContext,
  ReactNode,
  useMemo,
  useState,
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
  updateOrder,
} from '#reducers/OrderReducer'
import CommerceLayerContext from '#context/CommerceLayerContext'
import OrderContext, { defaultOrderContext } from '#context/OrderContext'
import { ResourceIncluded } from '#reducers/OrderReducer'
import components from '#config/components'
import { BaseMetadataObject } from '#typings'
import OrderStorageContext from '#context/OrderStorageContext'
import type { OrderCreate, Order } from '@commercelayer/sdk'
import { BaseError } from '#typings/errors'
import compareObjAttribute from '#utils/compareObjAttribute'

const propTypes = components.OrderContainer.propTypes
const defaultProps = components.OrderContainer.defaultProps
const displayName = components.OrderContainer.displayName

type Props = {
  children: ReactNode
  metadata?: BaseMetadataObject
  attributes?: OrderCreate
  orderId?: string
  fetchOrder?: (order: Order) => void
}

export function OrderContainer(props: Props) {
  const { orderId, children, metadata, attributes, fetchOrder } = props
  const [state, dispatch] = useReducer(orderReducer, orderInitialState)
  const [lock, setLock] = useState(false)
  const [lockOrder, setLockOrder] = useState(true)
  const config = useContext(CommerceLayerContext)
  const {
    persistKey,
    clearWhenPlaced,
    getLocalOrder,
    setLocalOrder,
    deleteLocalOrder,
  } = useContext(OrderStorageContext)
  useEffect(() => {
    if (!state.withoutIncludes) {
      dispatch({
        type: 'setLoading',
        payload: {
          loading: true,
        },
      })
    }
  }, [state.withoutIncludes])

  useEffect(() => {
    if (attributes && state?.order && !lock) {
      const updateAttributes = compareObjAttribute({
        attributes: attributes,
        object: state.order,
      })
      if (Object.keys(updateAttributes).length > 0) {
        void updateOrder({
          id: state.order.id,
          attributes: updateAttributes,
          dispatch,
          config,
          include: state.include,
          state,
        })
        setLock(true)
      }
    }
    return () => {
      if (attributes && state?.order) {
        const updateAttributes = compareObjAttribute({
          attributes: attributes,
          object: state.order,
        })
        if (state.order && Object.keys(updateAttributes).length === 0) {
          setLock(false)
        }
      }
    }
  }, [attributes, state?.order, lock])
  useEffect(() => {
    const localOrder = persistKey ? getLocalOrder(persistKey) : orderId
    const startRequest = Object.keys(state?.includeLoaded || {}).filter(
      (key) => state?.includeLoaded?.[key as ResourceIncluded] === true
    )
    const getOrder = async () => {
      const removeOrderPlaced = !!(persistKey && clearWhenPlaced)
      localOrder &&
        (await getApiOrder({
          id: localOrder,
          dispatch,
          config,
          persistKey,
          clearWhenPlaced: removeOrderPlaced,
          deleteLocalOrder,
          state,
        }))
    }
    if (config.accessToken && !state.loading) {
      if (
        localOrder &&
        !state.order &&
        state.include?.length === startRequest.length &&
        !state.withoutIncludes &&
        !lockOrder
      ) {
        void getOrder()
      } else if (state?.order) {
        fetchOrder && fetchOrder(state.order)
      } else if (
        state.withoutIncludes &&
        !state.include?.length &&
        startRequest.length === 0
      ) {
        void getOrder()
      }
    } else if (
      [
        config.accessToken,
        !state.order,
        state.loading,
        state.withoutIncludes,
      ].every(Boolean)
    ) {
      dispatch({
        type: 'setLoading',
        payload: {
          loading: false,
        },
      })
    } else if (
      [
        config.accessToken,
        !state.order,
        state.loading,
        !state.withoutIncludes,
      ].every(Boolean)
    ) {
      dispatch({
        type: 'setLoading',
        payload: {
          loading: false,
        },
      })
    }
    return () => {
      if (!state.order && state.loading && !state.withoutIncludes) {
        if (state.include?.length === 0 && startRequest.length > 0) {
          dispatch({
            type: 'setLoading',
            payload: {
              loading: false,
            },
          })
        } else if (state.include && state.include?.length > 0) {
          dispatch({
            type: 'setIncludesResource',
            payload: {
              include: [],
            },
          })
          setLockOrder(false)
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
    state.withoutIncludes,
    lockOrder,
  ])
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
      addToCart: (values: AddToCartValues) =>
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
      updateOrder: async (args: UpdateOrderArgs) =>
        await defaultOrderContext['updateOrder']({
          ...args,
          dispatch,
          config,
          include: state.include,
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
