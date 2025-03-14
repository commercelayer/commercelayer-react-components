import {
  useEffect,
  useReducer,
  useContext,
  useMemo,
  useState,
  type JSX,
} from "react"
import orderReducer, {
  createOrder,
  getApiOrder,
  setOrderErrors,
  setOrder,
  type OrderCodeType,
  type AddResourceToInclude,
  orderInitialState,
  type UpdateOrderArgs,
  type SaveAddressToCustomerAddressBook,
  updateOrder,
  type ResourceIncluded,
  addToCart,
  paymentSourceRequest,
} from "#reducers/OrderReducer"
import CommerceLayerContext from "#context/CommerceLayerContext"
import OrderContext, { defaultOrderContext } from "#context/OrderContext"
import type { BaseMetadataObject } from "#typings"
import OrderStorageContext from "#context/OrderStorageContext"
import type { OrderCreate, Order } from "@commercelayer/sdk"
import type { BaseError } from "#typings/errors"
import compareObjAttribute from "#utils/compareObjAttribute"
import useCustomContext from "#utils/hooks/useCustomContext"
import type { DefaultChildrenType } from "#typings/globals"

interface Props {
  children: DefaultChildrenType
  /**
   * Metadata to add when creates a new order
   */
  metadata?: BaseMetadataObject
  /**
   * Attribute to add when creates/updates an order
   */
  attributes?: OrderCreate
  /**
   * ID of the order
   */
  orderId?: string
  /**
   * Callback called when the order is updated
   */
  fetchOrder?: (order: Order) => void
  /**
   * Indicate if Adyen gift card management is enabled
   */
  manageAdyenGiftCard?: boolean
}

/**
 * This component is responsible for fetching the order and store it in its context.
 * It also provides the `fetchOrder` callback that is triggered every time the order is updated (it returns the updated order object as argument).
 * When the order is not placed yet, its possible to pass the `metadata` and `attributes` props to update the order.
 *
 * <span title="Requirement" type="warning">
 * Must be a child of the `<CommerceLayer>` component. <br />
 * Can be a child of the `<OrderStorage>` component and receive the `orderId` from it.
 * </span>
 *
 * <span title="Children" type="info">
 * `<AddToCartButton>`,
 * `<AdjustmentAmount>`,
 * `<CartLink>`,
 * `<CheckoutLink>`,
 * `<DiscountAmount>`,
 * `<GiftCardAmount>`,
 * `<HostedCart>`,
 * `<OrderNumber>`,
 * `<PaymentMethodAmount>`,
 * `<PlaceOrderButton>`,
 * `<PlaceOrderContainer>`,
 * `<PrivacyAndTermsCheckbox>`,
 * `<Shipping Amount>`,
 * `<SubTotalAmount>`,
 * `<TaxesAmount>`,
 * `<TotalAmount>`,
 * </span>
 *
 * <span title="Core API" type="info">
 * Check the `orders` resource from our [Core API documentation](https://docs.commercelayer.io/core/v/api-reference/orders/object).
 * </span>
 */
export function OrderContainer(props: Props): JSX.Element {
  const {
    orderId,
    children,
    metadata,
    attributes,
    fetchOrder,
    manageAdyenGiftCard,
  } = props
  const [state, dispatch] = useReducer(orderReducer, orderInitialState)
  const [lock, setLock] = useState(false)
  const [lockOrder, setLockOrder] = useState(true)
  const config = useCustomContext({
    context: CommerceLayerContext,
    contextComponentName: "CommerceLayer",
    currentComponentName: "OrderContainer",
    key: "accessToken",
  })
  const {
    persistKey,
    clearWhenPlaced,
    getLocalOrder,
    setLocalOrder,
    deleteLocalOrder,
  } = useContext(OrderStorageContext)
  const getOrder = async (localOrder?: string | null): Promise<void> => {
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
  useEffect(() => {
    const localOrder = persistKey ? getLocalOrder(persistKey) : orderId
    if (state?.orderId) {
      if (localOrder != null && state.orderId !== localOrder) {
        getOrder(localOrder)
      } else {
        dispatch({
          type: "setOrderId",
          payload: {
            orderId: undefined,
            order: undefined,
          },
        })
      }
    }
  }, [persistKey])
  useEffect(() => {
    if (!state.withoutIncludes) {
      dispatch({
        type: "setLoading",
        payload: {
          loading: true,
        },
      })
    }
  }, [state.withoutIncludes])

  useEffect(() => {
    if (attributes && state?.order && !lock) {
      const updateAttributes = compareObjAttribute({
        attributes,
        object: state.order,
      })
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
        const updateAttributes = compareObjAttribute({
          attributes,
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
      (key) => state?.includeLoaded?.[key as ResourceIncluded] === true,
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
      } else if (
        state.withoutIncludes &&
        !state.include?.length &&
        startRequest.length === 0
      ) {
        getOrder(localOrder)
      }
    } else if (
      [
        config.accessToken,
        state.order == null,
        state.loading,
        state.withoutIncludes,
      ].every(Boolean)
    ) {
      dispatch({
        type: "setLoading",
        payload: {
          loading: false,
        },
      })
    } else if (
      [
        config.accessToken,
        state.order == null,
        state.loading,
        state.withoutIncludes === false,
      ].every(Boolean)
    ) {
      dispatch({
        type: "setLoading",
        payload: {
          loading: false,
        },
      })
    }
    return () => {
      if (
        state.order == null &&
        state.loading &&
        state.withoutIncludes === false
      ) {
        if (state.include?.length === 0 && startRequest.length > 0) {
          dispatch({
            type: "setLoading",
            payload: {
              loading: false,
            },
          })
        } else if (state.include && state.include?.length > 0) {
          dispatch({
            type: "setIncludesResource",
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
    Object.keys(state.includeLoaded ?? {}).length,
    state.include?.length,
    orderId,
    Object.keys(state?.order ?? {}).length,
    state.loading,
    state.withoutIncludes,
    lockOrder,
  ])
  const orderValue = useMemo(() => {
    if (fetchOrder != null && state?.order != null) {
      fetchOrder(state.order)
    }
    return {
      ...state,
      manageAdyenGiftCard,
      paymentSourceRequest: async (
        params: Parameters<typeof paymentSourceRequest>[number],
      ): ReturnType<typeof paymentSourceRequest> =>
        await paymentSourceRequest({ ...params, dispatch, state, config }),
      setOrder: (order: Order) => {
        setOrder(order, dispatch)
      },
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
          setLocalOrder,
        }),
      addToCart: async (
        params: Parameters<typeof addToCart>[number],
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
      saveAddressToCustomerAddressBook: (
        args: Parameters<SaveAddressToCustomerAddressBook>[0],
      ) => {
        defaultOrderContext.saveAddressToCustomerAddressBook({
          ...args,
          dispatch,
        })
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
      removeGiftCardOrCouponCode: async ({
        codeType,
      }: {
        codeType: OrderCodeType
      }) =>
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
    }
  }, [state, config.accessToken, persistKey])
  return (
    <OrderContext.Provider value={orderValue}>{children}</OrderContext.Provider>
  )
}

export default OrderContainer
