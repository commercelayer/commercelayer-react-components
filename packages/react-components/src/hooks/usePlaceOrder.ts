import type { RefObject } from "react"
import { useCallback, useContext, useEffect, useMemo, useReducer, useSyncExternalStore } from "react"
import CommerceLayerContext from "#context/CommerceLayerContext"
import OrderContext from "#context/OrderContext"
import placeOrderReducer, {
  type PlaceOrderOptions,
  placeOrderInitialState,
  placeOrderPermitted,
  setButtonRef,
  setPlaceOrder,
  setPlaceOrderStatus,
} from "#reducers/PlaceOrderReducer"
import { useHalfConfiguredTermsWarning } from "#utils/hooks/useHalfConfiguredTermsWarning"
import { useMissingTermsCheckboxWarning } from "#utils/hooks/useMissingTermsCheckboxWarning"
import { useOrganizationConfig } from "#utils/organization"
import { getAcceptedSnapshot, subscribe as subscribeToTerms } from "#utils/termsAcceptanceStore"

/**
 * Manages place-order state in standalone mode.
 *
 * When `isStandalone` is `true` the hook replicates the behaviour of
 * `<PlaceOrderContainer>`: it registers the required resource includes on
 * `OrderContext`, evaluates `placeOrderPermitted` whenever the order or privacy
 * & terms acceptance changes, and returns a fully-bound context value ready to
 * be passed to `<PlaceOrderContext.Provider>`.
 *
 * When `isStandalone` is `false` (i.e. a `<PlaceOrderContainer>` parent is
 * already present) all effects are no-ops and the returned value is unused —
 * the hook is still called unconditionally to satisfy the Rules of Hooks.
 */
export function usePlaceOrder({
  isStandalone,
  options,
}: {
  isStandalone: boolean
  options?: PlaceOrderOptions
}) {
  const [state, dispatch] = useReducer(placeOrderReducer, placeOrderInitialState)
  const { order, setOrder, setOrderErrors, include, addResourceToInclude, includeLoaded } =
    useContext(OrderContext)
  const config = useContext(CommerceLayerContext)
  const organizationConfig = useOrganizationConfig({ accessToken: config.accessToken })
  // <PrivacyAndTermsCheckbox> is a sibling of <PlaceOrderButton>, so acceptance
  // travels through a module-level store rather than React context.
  const orderId = order?.id
  const stableSubscribe = useCallback(
    (listener: () => void) => subscribeToTerms(orderId, listener),
    [orderId]
  )
  const termsAccepted = useSyncExternalStore(
    stableSubscribe,
    useCallback(() => getAcceptedSnapshot(orderId), [orderId]),
    // c8 ignore next — server snapshot only used during SSR hydration
    () => false
  )

  // biome-ignore lint/correctness/useExhaustiveDependencies: mirrors PlaceOrderContainer behavior
  useEffect(() => {
    if (!isStandalone) return
    if (!include?.includes("shipments.available_shipping_methods")) {
      addResourceToInclude({
        newResource: [
          "shipments.available_shipping_methods",
          "shipments.stock_line_items.line_item",
          "shipments.shipping_method",
          "shipments.stock_transfers.line_item",
          "shipments.stock_location",
        ],
      })
    } else if (!includeLoaded?.["shipments.available_shipping_methods"]) {
      addResourceToInclude({
        newResourceLoaded: {
          "shipments.available_shipping_methods": true,
          "shipments.stock_line_items.line_item": true,
          "shipments.shipping_method": true,
          "shipments.stock_transfers.line_item": true,
          "shipments.stock_location": true,
        },
      })
    }
    if (!include?.includes("billing_address")) {
      addResourceToInclude({ newResource: "billing_address" })
    } else if (!includeLoaded?.billing_address) {
      addResourceToInclude({ newResourceLoaded: { billing_address: true } })
    }
    if (!include?.includes("shipping_address")) {
      addResourceToInclude({ newResource: "shipping_address", resourcesIncluded: include })
    } else if (!includeLoaded?.shipping_address) {
      addResourceToInclude({ newResourceLoaded: { shipping_address: true } })
    }
    if (order) {
      placeOrderPermitted({
        config,
        dispatch,
        order,
        options,
        privacyUrl: organizationConfig?.urls?.privacy,
        termsUrl: organizationConfig?.urls?.terms,
        termsAccepted,
      })
    }
  }, [order, include, includeLoaded, organizationConfig, isStandalone, termsAccepted])

  useMissingTermsCheckboxWarning(isStandalone ? state.termsBlocking : false, orderId)
  useHalfConfiguredTermsWarning(
    organizationConfig?.urls?.privacy ?? order?.privacy_url,
    organizationConfig?.urls?.terms ?? order?.terms_url
  )

  const setButtonRefCallback = useCallback(
    (ref: RefObject<HTMLButtonElement | null>) => setButtonRef(ref, dispatch),
    []
  )

  const setPlaceOrderStatusCallback = useCallback(
    ({ status }: Parameters<typeof setPlaceOrderStatus>[0]) =>
      setPlaceOrderStatus({ status, dispatch }),
    []
  )

  const placeOrderPermittedCallback = useCallback(() => {
    placeOrderPermitted({
      config,
      dispatch,
      order,
      options,
      privacyUrl: organizationConfig?.urls?.privacy,
      termsUrl: organizationConfig?.urls?.terms,
      termsAccepted,
    })
  }, [config, order, options, organizationConfig, termsAccepted])

  return useMemo(
    () => ({
      ...state,
      /** Marks this context as provided — used to detect standalone vs container mode. */
      _isProvided: true as const,
      setPlaceOrder: async ({
        paymentSource,
        currentCustomerPaymentSourceId,
      }: {
        paymentSource?: Parameters<typeof setPlaceOrder>["0"]["paymentSource"]
        currentCustomerPaymentSourceId?: Parameters<
          typeof setPlaceOrder
        >["0"]["currentCustomerPaymentSourceId"]
      }) =>
        await setPlaceOrder({
          config,
          order,
          state,
          setOrderErrors,
          paymentSource,
          include,
          setOrder,
          currentCustomerPaymentSourceId,
        }),
      setPlaceOrderStatus: setPlaceOrderStatusCallback,
      placeOrderPermitted: placeOrderPermittedCallback,
      setButtonRef: setButtonRefCallback,
    }),
    [
      state,
      config,
      order,
      include,
      setOrderErrors,
      setOrder,
      setPlaceOrderStatusCallback,
      placeOrderPermittedCallback,
      setButtonRefCallback,
    ]
  )
}
