import { useEffect, useReducer, useContext, useMemo, useState } from 'react'
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
  ResourceIncluded,
  addToCart
} from '#reducers/OrderReducer'
import CommerceLayerContext from '#context/CommerceLayerContext'
import OrderContext, { defaultOrderContext } from '#context/OrderContext'
import { BaseMetadataObject } from '#typings'
import OrderStorageContext from '#context/OrderStorageContext'
import type { OrderCreate, Order } from '@commercelayer/sdk'
import { BaseError } from '#typings/errors'
import compareObjAttribute from '#utils/compareObjAttribute'

interface Props {
  children: JSX.Element[] | JSX.Element
  metadata?: BaseMetadataObject
  attributes?: OrderCreate
  orderId?: string
  fetchOrder?: (order: Order) => void
  loader?: string | JSX.Element
}

export function OrderContainer(props: Props): JSX.Element {
  const { orderId, children, metadata, attributes, fetchOrder, loader } = props
  const [state, dispatch] = useReducer(orderReducer, orderInitialState)
  const [lock, setLock] = useState(false)
  const [lockOrder, setLockOrder] = useState(true)
  const config = useContext(CommerceLayerContext)
  if (config.accessToken == null)
    throw new Error('Cannot use `OrderContainer` outside of `CommerceLayer`')
  const {
    persistKey,
    clearWhenPlaced,
    getLocalOrder,
    setLocalOrder,
    deleteLocalOrder
  } = useContext(OrderStorageContext)
  useEffect(() => {
    if (!state.withoutIncludes) {
      dispatch({
        type: 'setLoading',
        payload: {
          loading: true
        }
      })
    }
  }, [state.withoutIncludes])

  useEffect(() => {
    if (attributes && state?.order && !lock) {
      const updateAttributes = compareObjAttribute({
        attributes,
        object: state.order
      })
      if (Object.keys(updateAttributes).length > 0) {
        void updateOrder({
          id: state.order.id,
          attributes: updateAttributes,
          dispatch,
          config,
          include: state.include,
          state
        })
        setLock(true)
      }
    }
    return () => {
      if (attributes && state?.order) {
        const updateAttributes = compareObjAttribute({
          attributes,
          object: state.order
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
    const getOrder = async (): Promise<void> => {
      const removeOrderPlaced = !!(persistKey && clearWhenPlaced)
      localOrder &&
        (await getApiOrder({
          id: localOrder,
          dispatch,
          config,
          persistKey,
          clearWhenPlaced: removeOrderPlaced,
          deleteLocalOrder,
          state
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
      } else if (state?.order && fetchOrder) {
        fetchOrder(state.order)
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
        state.withoutIncludes
      ].every(Boolean)
    ) {
      dispatch({
        type: 'setLoading',
        payload: {
          loading: false
        }
      })
    } else if (
      [
        config.accessToken,
        !state.order,
        state.loading,
        !state.withoutIncludes
      ].every(Boolean)
    ) {
      dispatch({
        type: 'setLoading',
        payload: {
          loading: false
        }
      })
    }
    return () => {
      if (!state.order && state.loading && !state.withoutIncludes) {
        if (state.include?.length === 0 && startRequest.length > 0) {
          dispatch({
            type: 'setLoading',
            payload: {
              loading: false
            }
          })
        } else if (state.include && state.include?.length > 0) {
          dispatch({
            type: 'setIncludesResource',
            payload: {
              include: []
            }
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
    lockOrder
  ])
  const orderValue = useMemo(() => {
    return {
      ...state,
      setOrder: (order: Order) => setOrder(order, dispatch),
      getOrder: async (id: string): Promise<Order | undefined> =>
        await getApiOrder({ id, dispatch, config, state }),
      setOrderErrors: (errors: BaseError[]) =>
        setOrderErrors({ dispatch, errors }),
      createOrder: async (): Promise<string> =>
        await createOrder({
          persistKey,
          dispatch,
          config,
          state,
          orderMetadata: metadata,
          orderAttributes: attributes,
          setLocalOrder
        }),
      addToCart: async (values: AddToCartValues) =>
        await addToCart({
          ...values,
          persistKey,
          dispatch,
          state,
          config,
          errors: state.errors,
          orderMetadata: metadata || {},
          orderAttributes: attributes,
          setLocalOrder
        }),
      saveAddressToCustomerAddressBook: (
        args: Parameters<SaveAddressToCustomerAddressBook>[0]
      ) =>
        defaultOrderContext.saveAddressToCustomerAddressBook({
          ...args,
          dispatch
        }),
      setGiftCardOrCouponCode: async ({
        code,
        codeType
      }: {
        code: string
        codeType: OrderCodeType
      }) =>
        await defaultOrderContext.setGiftCardOrCouponCode({
          code,
          codeType,
          dispatch,
          order: state.order,
          config,
          include: state.include,
          state
        }),
      removeGiftCardOrCouponCode: async ({
        codeType
      }: {
        codeType: OrderCodeType
      }) =>
        await defaultOrderContext.removeGiftCardOrCouponCode({
          codeType,
          dispatch,
          order: state.order,
          config,
          include: state.include,
          state
        }),
      addResourceToInclude: (args: AddResourceToInclude) =>
        defaultOrderContext.addResourceToInclude({
          ...args,
          dispatch,
          resourcesIncluded: state.include,
          resourceIncludedLoaded: state.includeLoaded
        }),
      updateOrder: async (args: UpdateOrderArgs) =>
        await defaultOrderContext.updateOrder({
          ...args,
          dispatch,
          config,
          include: state.include,
          state
        })
    }
  }, [state, config.accessToken])
  if (state.loading && loader != null) return <>{loader}</>
  return (
    <OrderContext.Provider value={orderValue}>{children}</OrderContext.Provider>
  )
}

export default OrderContainer
