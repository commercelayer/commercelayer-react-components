import {
  type JSX,
  type ReactNode,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useReducer,
} from "react"
import CommerceLayerContext from "#context/CommerceLayerContext"
import OrderContext from "#context/OrderContext"
import PaymentMethodContext, { defaultPaymentMethodContext } from "#context/PaymentMethodContext"
import paymentMethodReducer, {
  getPaymentMethods,
  type PaymentMethodConfig,
  type PaymentRef,
  paymentMethodInitialState,
  setPaymentMethodConfig,
  setPaymentRef,
} from "#reducers/PaymentMethodReducer"
import type { BaseError } from "#typings/errors"
import useCustomContext from "#utils/hooks/useCustomContext"
import { isEmpty } from "#utils/isEmpty"
import { setCustomerOrderParam } from "#utils/localStorage"

interface Props {
  /**
   * The children components to render inside the PaymentMethodsContainer.
   */
  children: ReactNode
  /**
   * Optional configuration for payment methods.
   */
  config?: PaymentMethodConfig
}
/**
 * @deprecated Use `<PaymentMethod>` directly in standalone mode instead — it no longer
 * requires a surrounding container. Pass the optional `config` prop directly to
 * `<PaymentMethod>`. This component will be removed in the next major version.
 */
export function PaymentMethodsContainer(props: Props): JSX.Element {
  const { children, config } = props
  const [state, dispatch] = useReducer(paymentMethodReducer, paymentMethodInitialState)
  const {
    order,
    getOrder,
    setOrderErrors,
    include,
    addResourceToInclude,
    updateOrder,
    includeLoaded,
  } = useCustomContext({
    context: OrderContext,
    contextComponentName: "Order",
    currentComponentName: "PaymentMethodsContainer",
    key: "order",
  })
  const credentials = useContext(CommerceLayerContext)
  useEffect(() => {
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
      // Reset save customer payment source to wallet param if the payment source is null
      setCustomerOrderParam("_save_payment_source_to_customer_wallet", "false")
      dispatch({
        type: "setPaymentSource",
        payload: {
          paymentSource: undefined,
        },
      })
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
  // Stable callbacks — dispatch from useReducer is guaranteed stable, so empty deps are correct.
  // Without useCallback these would be new function references on every useMemo recompute, causing
  // payment forms (e.g. StripePaymentForm) that include setPaymentRef in their effect deps to
  // re-run their effects on every render → infinite loop.
  const setLoadingCallback = useCallback(({ loading }: { loading: boolean }) => {
    defaultPaymentMethodContext.setLoading({ loading, dispatch })
  }, [])
  const setPaymentRefCallback = useCallback(({ ref }: { ref: PaymentRef }) => {
    setPaymentRef({ ref, dispatch })
  }, [])
  const setPaymentMethodErrorsCallback = useCallback((errors: BaseError[]) => {
    defaultPaymentMethodContext.setPaymentMethodErrors(errors, dispatch)
  }, [])
  const contextValue = useMemo(() => {
    return {
      ...state,
      _isProvided: true as const,
      setLoading: setLoadingCallback,
      setPaymentRef: setPaymentRefCallback,
      setPaymentMethodErrors: setPaymentMethodErrorsCallback,
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
    }
  }, [
    state,
    order,
    getOrder,
    updateOrder,
    setOrderErrors,
    credentials,
    setLoadingCallback,
    setPaymentRefCallback,
    setPaymentMethodErrorsCallback,
  ])
  return (
    <PaymentMethodContext.Provider value={contextValue}>{children}</PaymentMethodContext.Provider>
  )
}

export default PaymentMethodsContainer
