import {
  type JSX,
  type ReactNode,
  type RefObject,
  useCallback,
  useContext,
  useEffect,
  useReducer,
  useSyncExternalStore,
} from "react"
import CommerceLayerContext from "#context/CommerceLayerContext"
import OrderContext from "#context/OrderContext"
import PlaceOrderContext from "#context/PlaceOrderContext"
import placeOrderReducer, {
  type PlaceOrderOptions,
  placeOrderInitialState,
  placeOrderPermitted,
  setButtonRef,
  setPlaceOrderStatus,
} from "#reducers/PlaceOrderReducer"
import useCustomContext from "#utils/hooks/useCustomContext"
import { useHalfConfiguredTermsWarning } from "#utils/hooks/useHalfConfiguredTermsWarning"
import { useMissingTermsCheckboxWarning } from "#utils/hooks/useMissingTermsCheckboxWarning"
import { useOrganizationConfig } from "#utils/organization"
import { getAcceptedSnapshot, subscribe as subscribeToTerms } from "#utils/termsAcceptanceStore"
import { setPlaceOrder } from "../../reducers/PlaceOrderReducer"

interface Props {
  children: ReactNode
  options?: PlaceOrderOptions
}

/**
 * @deprecated Use `<PlaceOrderButton>` and `<PrivacyAndTermsCheckbox>` directly —
 * they are now standalone and no longer require a container wrapper.
 * `PlaceOrderContainer` will be removed in the next major version.
 */
export function PlaceOrderContainer(props: Props): JSX.Element {
  const { children, options } = props
  const [state, dispatch] = useReducer(placeOrderReducer, placeOrderInitialState)
  const { order, setOrder, setOrderErrors, include, addResourceToInclude, includeLoaded } =
    useCustomContext({
      context: OrderContext,
      contextComponentName: "Order",
      currentComponentName: "PlaceOrderContainer",
      key: "order",
    })
  const config = useContext(CommerceLayerContext)
  const organizationConfig = useOrganizationConfig({
    accessToken: config.accessToken,
  })
  // Privacy & terms acceptance lives in a module-level store because
  // <PrivacyAndTermsCheckbox> is a sibling of <PlaceOrderButton>, not a child.
  // Subscribing here is what makes the button react the moment it changes.
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
  // biome-ignore lint/correctness/useExhaustiveDependencies: Infinite loop
  useEffect(() => {
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
      addResourceToInclude({
        newResource: "billing_address",
      })
    } else if (!includeLoaded?.billing_address) {
      addResourceToInclude({
        newResourceLoaded: { billing_address: true },
      })
    }
    if (!include?.includes("shipping_address")) {
      addResourceToInclude({
        newResource: "shipping_address",
        resourcesIncluded: include,
      })
    } else if (!includeLoaded?.shipping_address) {
      addResourceToInclude({
        newResourceLoaded: { shipping_address: true },
      })
    }
    if (order) {
      placeOrderPermitted({
        config,
        dispatch,
        order,
        options: {
          ...options,
        },
        privacyUrl: organizationConfig?.urls?.privacy,
        termsUrl: organizationConfig?.urls?.terms,
        termsAccepted,
      })
    }
  }, [order, include, includeLoaded, organizationConfig, termsAccepted])
  useMissingTermsCheckboxWarning(state.termsBlocking, orderId)
  useHalfConfiguredTermsWarning(
    organizationConfig?.urls?.privacy ?? order?.privacy_url,
    organizationConfig?.urls?.terms ?? order?.terms_url
  )

  const contextValue = {
    ...state,
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
    setPlaceOrderStatus: ({ status }: Parameters<typeof setPlaceOrderStatus>[0]) => {
      setPlaceOrderStatus({ status, dispatch })
    },
    placeOrderPermitted: () => {
      placeOrderPermitted({
        config,
        dispatch,
        order,
        options: {
          ...options,
        },
        privacyUrl: organizationConfig?.urls?.privacy,
        termsUrl: organizationConfig?.urls?.terms,
        termsAccepted,
      })
    },
    setButtonRef: (ref: RefObject<HTMLButtonElement | null>) => {
      setButtonRef(ref, dispatch)
    },
  }
  return <PlaceOrderContext.Provider value={contextValue}>{children}</PlaceOrderContext.Provider>
}

export default PlaceOrderContainer
