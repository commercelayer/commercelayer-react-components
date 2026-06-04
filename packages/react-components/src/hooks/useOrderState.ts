import type { Order, OrderCreate } from "@commercelayer/sdk"
import { useCallback, useMemo, useReducer, useState } from "react"
import type { CommerceLayerConfig } from "#context/CommerceLayerContext"
import { defaultOrderContext } from "#context/OrderContext"
import type { OrderStorageConfig } from "#context/OrderStorageContext"
import orderReducer, {
  addToCart,
  createOrder,
  getApiOrder,
  getOrderByFields,
  type AddResourceToInclude,
  type OrderCodeType,
  orderInitialState,
  paymentSourceRequest,
  type ResourceIncluded,
  type SaveAddressToCustomerAddressBook,
  setOrder,
  setOrderErrors,
  type UpdateOrderArgs,
  updateOrder,
} from "#reducers/OrderReducer"
import type { BaseMetadataObject } from "#typings"
import type { BaseError } from "#typings/errors"
import compareObjAttribute from "#utils/compareObjAttribute"
import { useEffect } from "react"

interface UseOrderStateConfig
  extends Pick<CommerceLayerConfig, "accessToken" | "interceptors">,
    Pick<
      OrderStorageConfig,
      "persistKey" | "clearWhenPlaced" | "getLocalOrder" | "setLocalOrder" | "deleteLocalOrder"
    > {
  orderId?: string
  metadata?: BaseMetadataObject
  attributes?: OrderCreate
  fetchOrder?: (order: Order) => void
}

/**
 * Internal hook that encapsulates the full order state machine used by
 * `<OrderContainer>`. Not intended for direct consumer use — use
 * `useOrderContainer()` or `useOrder()` from `@commercelayer/hooks` instead.
 */
export function useOrderState({
  accessToken,
  interceptors,
  orderId,
  metadata,
  attributes,
  fetchOrder,
  persistKey,
  clearWhenPlaced,
  getLocalOrder,
  setLocalOrder,
  deleteLocalOrder,
}: UseOrderStateConfig) {
  const [state, dispatch] = useReducer(orderReducer, orderInitialState)
  const [lock, setLock] = useState(false)
  const [lockOrder, setLockOrder] = useState(true)

  const config: CommerceLayerConfig = useMemo(
    () => ({ accessToken, interceptors }),
    [accessToken, interceptors]
  )

  const getOrder = useCallback(
    async (localOrder?: string | null): Promise<void> => {
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
    },
    [persistKey, clearWhenPlaced, config, deleteLocalOrder, state]
  )

  // biome-ignore lint/correctness/useExhaustiveDependencies: persistKey intentionally the only dep — mirrors original OrderContainer behavior
  useEffect(() => {
    const localOrder = persistKey ? getLocalOrder(persistKey) : orderId
    if (state?.orderId) {
      if (localOrder != null && state.orderId !== localOrder) {
        getOrder(localOrder)
      } else {
        dispatch({
          type: "setOrderId",
          payload: { orderId: undefined, order: undefined },
        })
      }
    }
  }, [persistKey])

  useEffect(() => {
    if (!state.withoutIncludes) {
      dispatch({ type: "setLoading", payload: { loading: true } })
    }
  }, [state.withoutIncludes])

  // biome-ignore lint/correctness/useExhaustiveDependencies: attributes/order/lock intentional — full dep list causes infinite update loop
  useEffect(() => {
    if (attributes && state?.order && !lock) {
      const updateAttributes = compareObjAttribute({ attributes, object: state.order })
      if (Object.keys(updateAttributes).length > 0) {
        updateOrder({
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
        const updateAttributes = compareObjAttribute({ attributes, object: state.order })
        if (state.order && Object.keys(updateAttributes).length === 0) {
          setLock(false)
        }
      }
    }
  }, [attributes, state?.order, lock])

  // biome-ignore lint/correctness/useExhaustiveDependencies: complex dep array mirrors original OrderContainer — adding all deps causes fetch loops
  useEffect(() => {
    const localOrder = persistKey ? getLocalOrder(persistKey) : orderId
    const startRequest = Object.keys(state?.includeLoaded || {}).filter(
      (key) => state?.includeLoaded?.[key as ResourceIncluded] === true
    )
    if (config.accessToken && state.loading === false && state?.order == null) {
      if (
        localOrder &&
        !state.order &&
        state.include?.length === startRequest.length &&
        !state.withoutIncludes &&
        !lockOrder
      ) {
        getOrder(localOrder)
      } else if (state.withoutIncludes && !state.include?.length && startRequest.length === 0) {
        getOrder(localOrder)
      }
    } else if (
      [config.accessToken, state.order == null, state.loading, state.withoutIncludes].every(Boolean)
    ) {
      dispatch({ type: "setLoading", payload: { loading: false } })
    } else if (
      [
        config.accessToken,
        state.order == null,
        state.loading,
        state.withoutIncludes === false,
      ].every(Boolean)
    ) {
      dispatch({ type: "setLoading", payload: { loading: false } })
    }
    return () => {
      if (state.order == null && state.loading && state.withoutIncludes === false) {
        if (state.include?.length === 0 && startRequest.length > 0) {
          dispatch({ type: "setLoading", payload: { loading: false } })
        } else if (state.include && state.include?.length > 0) {
          dispatch({ type: "setIncludesResource", payload: { include: [] } })
          setLockOrder(false)
        }
      }
    }
  }, [
    config.accessToken,
    Object.keys(state.includeLoaded ?? {}).length,
    state.include?.length,
    orderId,
    Object.keys(state?.order ?? {}).length,
    state.loading,
    state.withoutIncludes,
    lockOrder,
  ])

  return useMemo(() => {
    if (fetchOrder != null && state?.order != null) {
      fetchOrder(state.order)
    }
    return {
      ...state,
      managePaymentProviderGiftCards:
        // @ts-expect-error no type
        state.order?.payment_source?.payment_request_data?.payment_method?.type === "giftcard",
      paymentSourceRequest: async (
        params: Parameters<typeof paymentSourceRequest>[number]
      ): ReturnType<typeof paymentSourceRequest> =>
        await paymentSourceRequest({ ...params, dispatch, state, config }),
      setOrder: (order: Order) => setOrder(order, dispatch),
      getOrder: async (id: string): Promise<Order | undefined> =>
        await getApiOrder({ id, dispatch, config, state }),
      setOrderErrors: (errors: BaseError[]) => setOrderErrors({ dispatch, errors }),
      createOrder: async (): Promise<string> =>
        await createOrder({
          persistKey,
          dispatch,
          config,
          state,
          orderMetadata: metadata,
          orderAttributes: attributes,
          setLocalOrder,
        }),
      addToCart: async (
        params: Parameters<typeof addToCart>[number]
      ): ReturnType<typeof addToCart> =>
        await addToCart({
          ...params,
          persistKey,
          dispatch,
          state,
          config,
          errors: state.errors,
          orderMetadata: metadata || {},
          orderAttributes: attributes,
          setLocalOrder,
        }),
      saveAddressToCustomerAddressBook: (args: Parameters<SaveAddressToCustomerAddressBook>[0]) => {
        defaultOrderContext.saveAddressToCustomerAddressBook({ ...args, dispatch })
      },
      setGiftCardOrCouponCode: async ({
        code,
        codeType,
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
          state,
        }),
      removeGiftCardOrCouponCode: async ({ codeType }: { codeType: OrderCodeType }) =>
        await defaultOrderContext.removeGiftCardOrCouponCode({
          codeType,
          dispatch,
          order: state.order,
          config,
          include: state.include,
          state,
        }),
      addResourceToInclude: (args: AddResourceToInclude) => {
        defaultOrderContext.addResourceToInclude({
          ...args,
          dispatch,
          resourcesIncluded: state.include,
          resourceIncludedLoaded: state.includeLoaded,
        })
      },
      updateOrder: async (args: UpdateOrderArgs) =>
        await defaultOrderContext.updateOrder({
          ...args,
          dispatch,
          config,
          include: state.include,
          state,
        }),
      getOrderByFields,
    }
  }, [state, config.accessToken, persistKey, config, setLocalOrder, metadata, fetchOrder, attributes])
}
