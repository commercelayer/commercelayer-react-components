import { useCallback, useContext, useEffect, useMemo, useReducer } from "react"
import CommerceLayerContext from "#context/CommerceLayerContext"
import OrderContext from "#context/OrderContext"
import { defaultPaymentMethodContext } from "#context/PaymentMethodContext"
import paymentMethodReducer, {
  getPaymentMethods,
  type PaymentMethodConfig,
  type PaymentRef,
  paymentMethodInitialState,
  setPaymentMethodConfig,
  setPaymentRef,
} from "#reducers/PaymentMethodReducer"
import type { BaseError } from "#typings/errors"
import { isEmpty } from "#utils/isEmpty"
import { setCustomerOrderParam } from "#utils/localStorage"

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
}: {
  isStandalone: boolean
  config?: PaymentMethodConfig
}) {
  const [state, dispatch] = useReducer(paymentMethodReducer, paymentMethodInitialState)
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

  useEffect(() => {
    if (!isStandalone) return
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
    if (credentials && order && !state.paymentMethods) {
      getPaymentMethods({ order, dispatch })
    }
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
    credentials,
    getOrder,
    addResourceToInclude,
    include?.includes,
    state.paymentMethods,
    state.config,
    includeLoaded?.available_payment_methods,
    config,
  ])

  const setLoading = useCallback(({ loading }: { loading: boolean }) => {
    defaultPaymentMethodContext.setLoading({ loading, dispatch })
  }, [])

  const setPaymentRefCallback = useCallback(({ ref }: { ref: PaymentRef }) => {
    setPaymentRef({ ref, dispatch })
  }, [])

  const setPaymentMethodErrors = useCallback((errors: BaseError[]) => {
    defaultPaymentMethodContext.setPaymentMethodErrors(errors, dispatch)
  }, [])

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
    ]
  )
}
