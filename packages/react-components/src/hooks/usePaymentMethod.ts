import { useCallback, useContext, useEffect, useMemo } from "react"
import CommerceLayerContext from "#context/CommerceLayerContext"
import OrderContext from "#context/OrderContext"
import { defaultPaymentMethodContext } from "#context/PaymentMethodContext"
import { useSharedReducer } from "#hooks/useSharedReducer"
import paymentMethodReducer, {
  getPaymentMethods,
  type PaymentMethodConfig,
  type PaymentRef,
  setPaymentMethodConfig,
  setPaymentRef,
} from "#reducers/PaymentMethodReducer"
import type { BaseError } from "#typings/errors"
import { isEmpty } from "#utils/isEmpty"
import { setCustomerOrderParam } from "#utils/localStorage"
import { paymentMethodStore } from "#utils/paymentMethodStore"

/**
 * Manages payment method state and data-fetching in standalone mode.
 *
 * When `isStandalone` is `true` the hook replicates the behaviour of
 * `<PaymentMethodsContainer>`: it sets up the includes on `OrderContext`,
 * fetches the available payment methods, and returns a fully-bound context
 * value ready to be passed to `<PaymentMethodContext.Provider>`.
 *
 * When `isStandalone` is `false` (i.e. a `<PaymentMethodsContainer>` parent
 * is already present) all effects are no-ops and the returned value is
 * unused — the hook is still called unconditionally to satisfy the Rules of
 * Hooks.
 */
export function usePaymentMethod({
  isStandalone,
  config,
  isOwner = false,
  needsPaymentResources = false,
}: {
  isStandalone: boolean
  config?: PaymentMethodConfig
  /**
   * Whether this instance drives the state rather than only reading it.
   * `<PaymentMethod>` owns it; a component that merely reads the selected
   * method must not re-register the order includes or refetch the payment
   * methods, or every reader would do the container's job over again.
   */
  isOwner?: boolean
  /**
   * Whether this instance renders the payment source and therefore needs it on
   * the order. Only the components that show it ask for the includes: a generic
   * consumer such as `<Errors>` is mounted on every step, and making it ask
   * would refetch the order where nothing needs paying.
   */
  needsPaymentResources?: boolean
}) {
  const {
    order,
    getOrder,
    setOrderErrors,
    include,
    addResourceToInclude,
    updateOrder,
    includeLoaded,
  } = useContext(OrderContext)
  const credentials = useContext(CommerceLayerContext)
  // Shared per order rather than held by this component: the place-order button
  // reads this state and is a sibling of the payment step, not its descendant.
  const [state, dispatch] = useSharedReducer(paymentMethodStore, paymentMethodReducer, {
    accessToken: credentials.accessToken,
    orderId: order?.id,
  })

  useEffect(() => {
    if (!isStandalone || !isOwner) return
    if (!include?.includes("available_payment_methods")) {
      addResourceToInclude({
        newResource: [
          "available_payment_methods",
          "payment_source",
          "payment_method",
          "line_items.line_item_options.sku_option",
          "line_items.item",
        ],
      })
    } else if (!includeLoaded?.available_payment_methods) {
      addResourceToInclude({
        newResourceLoaded: {
          available_payment_methods: true,
          payment_source: true,
          payment_method: true,
          "line_items.line_item_options.sku_option": true,
          "line_items.item": true,
        },
      })
    }
    if (config && isEmpty(state.config)) setPaymentMethodConfig(config, dispatch)
    if (order?.payment_source === null) {
      setCustomerOrderParam("_save_payment_source_to_customer_wallet", "false")
      dispatch({ type: "setPaymentSource", payload: { paymentSource: undefined } })
    }
    if (
      order?.id &&
      order?.payment_source == null &&
      !["draft", "pending"].includes(order?.status) &&
      !state.paymentMethods
    ) {
      getOrder(order.id)
    }
  }, [
    isStandalone,
    order,
    getOrder,
    addResourceToInclude,
    include?.includes,
    state.paymentMethods,
    state.config,
    includeLoaded?.available_payment_methods,
    config,
    isOwner,
    dispatch,
  ])

  // Reading the methods off the order is not a request — `getPaymentMethods`
  // only copies `available_payment_methods`, `payment_method` and
  // `payment_source` into the state — so every instance may do it, owner or
  // not. That matters where no owner is mounted at all: the order recap on the
  // last step renders a `<PaymentSource readonly>` with no `<PaymentMethod>`
  // anywhere near it, and used to take this state from the container.
  useEffect(() => {
    // The two resources the derivation below reads. A reader asks for them
    // itself rather than relying on an owner having asked first: the order
    // recap on the last step has no owner anywhere near it. With a container
    // above, it is the one that registers includes and this stays out of it.
    const needed =
      isStandalone && (isOwner || needsPaymentResources)
        ? (["payment_method", "payment_source"] as const).filter(
            (resource) => !include?.includes(resource)
          )
        : []
    if (needed.length > 0) {
      // One call for everything missing: each registration grows the include
      // list, and the order is fetched again whenever it grows.
      addResourceToInclude({ newResource: [...needed], resourcesIncluded: include })
    }
    if (credentials && order && !state.paymentMethods) {
      getPaymentMethods({ order, dispatch })
    }
    // Same payment source, fresher representation: the order is fetched again
    // after it is placed and only then carries the card's brand and last
    // digits. Deriving once would leave the order recap showing the
    // placeholders the source had before the payment went through — the state
    // outlives the components that built it, so it has to follow the order.
    const orderPaymentSource = order?.payment_source
    if (
      orderPaymentSource != null &&
      state.paymentSource != null &&
      orderPaymentSource.id === state.paymentSource.id &&
      orderPaymentSource !== state.paymentSource
    ) {
      dispatch({
        type: "setPaymentSource",
        payload: { paymentSource: orderPaymentSource },
      })
    }
  }, [
    credentials,
    order,
    state.paymentMethods,
    state.paymentSource,
    dispatch,
    include,
    addResourceToInclude,
    isStandalone,
    isOwner,
    needsPaymentResources,
  ])

  const setLoading = useCallback(
    ({ loading }: { loading: boolean }) => {
      defaultPaymentMethodContext.setLoading({ loading, dispatch })
    },
    [dispatch]
  )

  const setPaymentRefCallback = useCallback(
    ({ ref }: { ref: PaymentRef }) => {
      setPaymentRef({ ref, dispatch })
    },
    [dispatch]
  )

  const setPaymentMethodErrors = useCallback(
    (errors: BaseError[]) => {
      defaultPaymentMethodContext.setPaymentMethodErrors(errors, dispatch)
    },
    [dispatch]
  )

  return useMemo(
    () => ({
      ...state,
      /** Marks this context as provided — used by `<PaymentMethod>` to detect standalone mode. */
      _isProvided: true as const,
      setLoading,
      setPaymentRef: setPaymentRefCallback,
      setPaymentMethodErrors,
      setPaymentMethod: async (args: any) =>
        await defaultPaymentMethodContext.setPaymentMethod({
          ...args,
          config: credentials,
          updateOrder,
          order,
          dispatch,
          setOrderErrors,
        }),
      setPaymentSource: async (args: any) =>
        await defaultPaymentMethodContext.setPaymentSource({
          ...state,
          ...args,
          config: credentials,
          dispatch,
          getOrder,
          updateOrder,
          order,
        }),
      updatePaymentSource: async (args: any) => {
        await defaultPaymentMethodContext.updatePaymentSource({
          ...args,
          config: credentials,
          dispatch,
        })
      },
      destroyPaymentSource: async (args: any) => {
        await defaultPaymentMethodContext.destroyPaymentSource({
          ...args,
          dispatch,
          config: credentials,
          updateOrder,
          orderId: order?.id,
        })
      },
    }),
    [
      state,
      order,
      getOrder,
      updateOrder,
      setOrderErrors,
      credentials,
      setLoading,
      setPaymentRefCallback,
      setPaymentMethodErrors,
      dispatch,
    ]
  )
}
