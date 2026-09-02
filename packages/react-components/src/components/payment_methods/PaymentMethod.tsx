import type { Order, PaymentMethod as PaymentMethodType } from "@commercelayer/sdk"
import { type JSX, type MouseEvent, useContext, useEffect, useRef, useState } from "react"
import CustomerContext from "#context/CustomerContext"
import OrderContext from "#context/OrderContext"
import PaymentMethodChildrenContext from "#context/PaymentMethodChildrenContext"
import PaymentMethodContext from "#context/PaymentMethodContext"
import PlaceOrderContext from "#context/PlaceOrderContext"
import { usePaymentMethod } from "#hooks/usePaymentMethod"
import { usePaymentsModel } from "#hooks/usePaymentsModel"
import type { PaymentMethodConfig, PaymentResource } from "#reducers/PaymentMethodReducer"
import type { LoaderType } from "#typings"
import type { DefaultChildrenType } from "#typings/globals"
import { getAvailableExpressPayments } from "#utils/expressPaymentHelper"
import getLoaderComponent from "#utils/getLoaderComponent"
import {
  getCkoAttributes,
  getExternalPaymentAttributes,
  getPaypalAttributes,
} from "#utils/getPaymentAttributes"
import { isEmpty } from "#utils/isEmpty"
import { sortPaymentMethods } from "#utils/payment-methods/sortPaymentMethods"

export interface PaymentMethodOnClickParams {
  payment?: PaymentMethodType | Record<string, any>
  order?: Order
  paymentSource?: Order["payment_source"]
}

type Props = {
  /**
   * Hide payment methods by an array of strings or a function that returns a boolean
   */
  hide?: PaymentResource[] | ((payment: PaymentMethodType) => boolean)
  children: DefaultChildrenType
  /**
   * Set CSS classes when the payment method is selected
   */
  activeClass?: string
  /**
   * Customize the loader component
   */
  loader?: LoaderType
  /**
   * Show loader while fetching payment methods
   * @default undefined
   */
  showLoader?: boolean
  /**
   * Auto select the payment method when there is only one available
   */
  autoSelectSinglePaymentMethod?: boolean | (() => void)
  /**
   * Enable express payment. Other payment methods will be disabled.
   */
  expressPayments?: boolean
  /**
   * Sort payment methods by an array of strings
   */
  sortBy?: Array<PaymentMethodType["payment_source_type"]>
  /**
   * Payment method configuration (gateway keys, options, etc.).
   * Required in standalone mode (when used without `<PaymentMethodsContainer>`).
   */
  config?: PaymentMethodConfig
} & Omit<JSX.IntrinsicElements["div"], "onClick" | "children"> &
  (
    | {
        clickableContainer: true
        onClick?: (params: PaymentMethodOnClickParams) => void
      }
    | {
        clickableContainer?: never
        onClick?: never
      }
  )

export function PaymentMethod({
  children,
  className,
  activeClass,
  loader = "Loading...",
  clickableContainer,
  autoSelectSinglePaymentMethod,
  expressPayments,
  showLoader,
  hide,
  onClick,
  sortBy,
  config: configProp,
  ...p
}: Props): JSX.Element {
  const paymentsModel = usePaymentsModel()
  const [loading, setLoading] = useState(true)
  const [paymentSelected, setPaymentSelected] = useState("")
  const [paymentSourceCreated, setPaymentSourceCreated] = useState(false)
  const loadingResourceRef = useRef(false)
  /** Latches once the methods have rendered, so the loader can never unmount them again. */
  const hasRenderedMethodsRef = useRef(false)

  // Detect standalone mode: no <PaymentMethodsContainer> parent has set _isProvided.
  const parentCtx = useContext(PaymentMethodContext)
  const isStandalone = parentCtx._isProvided !== true

  // Always call the hook (Rules of Hooks). When not standalone, effects are
  // guarded internally and the returned value is not used.
  const standaloneCtx = usePaymentMethod({ isStandalone, config: configProp })

  const {
    paymentMethods,
    currentPaymentMethodId,
    setPaymentMethod,
    setLoading: setLoadingPlaceOrder,
    paymentSource,
    setPaymentSource,
    config,
    errors,
  } = isStandalone ? standaloneCtx : parentCtx
  const { order } = useContext(OrderContext)
  const { getCustomerPaymentSources } = useContext(CustomerContext)
  const { status } = useContext(PlaceOrderContext)
  /**
   * A partially-authorized order is mid-payment: part of the total is covered (an Adyen gift
   * card, say) and the shopper still has to pay the remainder with another method, in the
   * gateway that is already on screen. Raising the loader in that window unmounts it.
   */
  const isPartiallyAuthorized = order?.payment_status === "partially_authorized"
  useEffect(() => {
    // Silencing this component in render is not enough: React runs a mounted
    // component's effects whatever it returns, so without this the newer
    // model's orders get a payment_method written behind the tree that is
    // supposed to be inactive — and the API then drops
    // available_payment_settings, flipping the order onto the older model for
    // good.
    if (paymentsModel === "payment_sessions") return
    if (paymentMethods != null && !isEmpty(paymentMethods) && expressPayments) {
      const [paymentMethod] = getAvailableExpressPayments(paymentMethods)
      if (!paymentSource && paymentMethod != null) {
        const selectExpressPayment = async (): Promise<void> => {
          setLoadingPlaceOrder({ loading: true })
          setPaymentSelected(paymentMethod.id)
          const paymentMethodId = paymentMethod?.id
          const paymentResource = paymentMethod?.payment_source_type as PaymentResource
          await setPaymentMethod({ paymentResource, paymentMethodId })
          const ps = await setPaymentSource({
            paymentResource,
            order,
          })
          if (ps && paymentMethod && onClick != null) {
            onClick({ payment: paymentMethod, order, paymentSource: ps })
            setTimeout(() => {
              if (showLoader && errors?.length === 0) {
                setLoading(showLoader)
              } else {
                setLoading(false)
              }
            }, 200)
          }
          setLoadingPlaceOrder({ loading: false })
        }
        selectExpressPayment()
      }
    }
  }, [
    expressPayments,
    errors?.length,
    setPaymentMethod,
    setPaymentSource,
    paymentMethods,
    setLoadingPlaceOrder,
    order,
    onClick,
    paymentSource,
    showLoader,
    paymentsModel,
  ])
  useEffect(() => {
    // Silencing this component in render is not enough: React runs a mounted
    // component's effects whatever it returns, so without this the newer
    // model's orders get a payment_method written behind the tree that is
    // supposed to be inactive — and the API then drops
    // available_payment_settings, flipping the order onto the older model for
    // good.
    if (paymentsModel === "payment_sessions") return
    if (
      paymentMethods != null &&
      !paymentSourceCreated &&
      !loadingResourceRef.current &&
      !isEmpty(paymentMethods)
    ) {
      loadingResourceRef.current = true
      if (autoSelectSinglePaymentMethod != null && !expressPayments) {
        const autoSelect = async (): Promise<void> => {
          const isSingle = paymentMethods.length === 1
          const paymentSourceStatus = paymentSource
            ? // @ts-expect-error no type
              paymentSource.payment_response?.status?.toLowerCase?.()
            : null
          if (isSingle) {
            const [paymentMethod] = paymentMethods ?? []
            if (paymentMethod && !paymentSource) {
              setLoadingPlaceOrder({ loading: true })
              setPaymentSelected(paymentMethod.id)
              const paymentMethodId = paymentMethod?.id
              const paymentResource = paymentMethod?.payment_source_type as PaymentResource
              await setPaymentMethod({ paymentResource, paymentMethodId })
              let attributes: Record<string, unknown> | undefined = {}
              if (config != null && paymentResource === "paypal_payments") {
                attributes = getPaypalAttributes(paymentResource, config)
              }
              if (config != null && paymentResource === "external_payments") {
                attributes = getExternalPaymentAttributes(paymentResource, config)
              }
              if (config != null && paymentResource === "checkout_com_payments") {
                attributes = getCkoAttributes(paymentResource, config)
              }
              const ps = await setPaymentSource({
                paymentResource,
                order,
                attributes,
              })
              if (ps && paymentMethod && onClick != null) {
                setPaymentSourceCreated(true)
                onClick({ payment: paymentMethod, order, paymentSource: ps })
                setTimeout(() => {
                  if (showLoader && errors?.length === 0) {
                    setLoading(showLoader)
                  } else {
                    setLoading(false)
                  }
                }, 200)
              }
              if (getCustomerPaymentSources) {
                getCustomerPaymentSources()
              }
              setLoadingPlaceOrder({ loading: false })
            }
            if (typeof autoSelectSinglePaymentMethod === "function") {
              autoSelectSinglePaymentMethod()
            }
          } else {
            setTimeout(() => {
              if (showLoader && errors?.length === 0 && paymentSourceStatus !== "declined") {
                setLoading(showLoader)
              } else {
                setLoading(false)
              }
            }, 200)
          }
        }
        autoSelect()
      }
    }
  }, [
    errors?.length,
    setLoadingPlaceOrder,
    (paymentSource as any)?.payment_response?.status?.toLowerCase,
    paymentMethods,
    order,
    config,
    setPaymentSource,
    setPaymentMethod,
    paymentSourceCreated,
    onClick,
    getCustomerPaymentSources,
    expressPayments,
    paymentSource,
    showLoader,
    autoSelectSinglePaymentMethod,
    paymentsModel,
  ])
  useEffect(() => {
    if (paymentMethods) {
      const isSingle = paymentMethods.length === 1
      const paymentSourceStatus = paymentSource
        ? // @ts-expect-error no type
          paymentSource.payment_response?.status?.toLowerCase?.()
        : null
      if (isSingle && autoSelectSinglePaymentMethod) {
        if (paymentSource) {
          setTimeout(() => {
            if (showLoader && errors?.length === 0 && paymentSourceStatus !== "declined") {
              setLoading(showLoader)
            } else {
              setLoading(false)
            }
          }, 200)
        }
      } else {
        if (showLoader && errors?.length === 0 && paymentSourceStatus !== "declined") {
          setLoading(showLoader)
        } else {
          setLoading(false)
        }
      }
    }
    if (currentPaymentMethodId) setPaymentSelected(currentPaymentMethodId)
    return () => {
      setLoading(true)
      setPaymentSelected("")
    }
  }, [
    paymentMethods,
    currentPaymentMethodId,
    errors?.length,
    showLoader,
    (paymentSource as any)?.payment_response?.status?.toLowerCase,
    paymentSource,
    autoSelectSinglePaymentMethod,
  ])
  useEffect(() => {
    const status =
      // @ts-expect-error no type
      order?.payment_source?.payment_response?.status
    // If showLoader is undefined, we don't change the loading
    //
    // `content` swaps the whole subtree for the loader rather than overlaying it, so raising
    // `loading` here unmounts <PaymentGateway> and with it any mounted Adyen Drop-in. A gift
    // card authorization is exactly what populates `payment_response.status`, so without the
    // partial-authorization guard this fires on the very update the shopper is mid-way
    // through and reloads the Drop-in — repeatedly, as the order settles.
    //
    // A partially-authorized order is still mid-payment: the shopper has to cover the
    // remainder in that same Drop-in, so the subtree has to stay mounted.
    if (showLoader && status && !isPartiallyAuthorized) {
      if (status.toLowerCase() === "declined") {
        setLoading(false)
      } else {
        setLoading(true)
      }
    } else {
      setLoading(false)
    }
    // @ts-expect-error no type
  }, [showLoader, order?.payment_source?.payment_response?.status, isPartiallyAuthorized])
  const sortedPaymentMethods =
    paymentMethods != null && sortBy != null
      ? sortPaymentMethods(paymentMethods, sortBy)
      : paymentMethods

  const components = sortedPaymentMethods
    ?.filter((payment) => {
      if (Array.isArray(hide)) {
        const source = payment?.payment_source_type as PaymentResource
        return !hide?.includes(source)
      }
      if (typeof hide === "function") {
        return hide(payment)
      }
      return true
    })
    .map((payment) => {
      const isActive = currentPaymentMethodId === payment?.id
      const paymentMethodProps = {
        payment,
        clickableContainer,
        paymentSelected,
        setPaymentSelected,
        expressPayments,
      }
      const paymentResource = payment?.payment_source_type as PaymentResource
      const onClickable = !clickableContainer
        ? undefined
        : async (e: MouseEvent<HTMLDivElement>) => {
            e.stopPropagation()
            const paymentMethodId = payment?.id
            const currentPaymentMethodId = order?.payment_method?.id
            if (paymentMethodId === currentPaymentMethodId) return
            if (status === "placing") return
            setLoadingPlaceOrder({ loading: true })
            setPaymentSelected(payment.id)
            const { order: updatedOrder } = await setPaymentMethod({
              paymentResource,
              paymentMethodId,
            })
            if (onClick) onClick({ payment, order: updatedOrder })
            setLoadingPlaceOrder({ loading: false })
          }
      return (
        // biome-ignore lint/a11y/useKeyWithClickEvents lint/a11y/noStaticElementInteractions: pre-existing pattern, keyboard interaction handled by payment provider
        <div
          data-testid={paymentResource}
          key={paymentResource}
          className={`${className ?? ""} ${isActive && activeClass != null ? activeClass : ""}`}
          onClick={(e) => {
            if (onClickable != null) {
              onClickable(e)
            }
          }}
          {...p}
        >
          <PaymentMethodChildrenContext.Provider value={paymentMethodProps}>
            {children}
          </PaymentMethodChildrenContext.Provider>
        </div>
      )
    })
  // Once the payment methods have rendered, never swap them back out for the loader.
  //
  // `content` replaces the whole subtree rather than overlaying the loader, so any later flip
  // of `loading` unmounts every gateway below — including a mounted Adyen Drop-in, which owns
  // the shopper's selected method and typed-in details and has to fully re-initialize on the
  // way back. Guarding the individual flips cannot close this: `payment_response.status` and
  // `payment_status` are populated by two different API calls, so there is a window where a
  // flip looks legitimate.
  //
  // This makes `showLoader` mean "while first fetching the payment methods", which is what it
  // documents ("Show loader while fetching payment methods"). Re-entering the loading state
  // after that is the glitch, not a feature.
  if (!loading) hasRenderedMethodsRef.current = true
  const content =
    !loading || hasRenderedMethodsRef.current ? <>{components}</> : getLoaderComponent(loader)

  // Step aside on the `payment_sessions` model. API version 2026-05 is
  // additive, so an order on the newer model still carries
  // `available_payment_methods` and this component would happily render them
  // alongside the newer tree — two sets of payment options, one of them
  // meaningless. This is where the precedence rule actually takes effect, and
  // it is what lets both trees be mounted together with no coordinator above.
  if (paymentsModel === "payment_sessions") return <></>

  // In standalone mode provide the context so that child components
  // (PaymentSource, PaymentGateway, etc.) can read payment state without
  // a surrounding <PaymentMethodsContainer>.
  if (isStandalone) {
    return (
      <PaymentMethodContext.Provider value={standaloneCtx}>{content}</PaymentMethodContext.Provider>
    )
  }
  return content
}

export default PaymentMethod
