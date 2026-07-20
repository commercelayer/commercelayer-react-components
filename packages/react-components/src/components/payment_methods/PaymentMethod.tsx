import type { Order, PaymentMethod as PaymentMethodType } from "@commercelayer/sdk"
import { type JSX, type MouseEvent, useContext, useEffect, useRef, useState } from "react"
import CustomerContext from "#context/CustomerContext"
import OrderContext from "#context/OrderContext"
import PaymentMethodChildrenContext from "#context/PaymentMethodChildrenContext"
import PaymentMethodContext from "#context/PaymentMethodContext"
import PlaceOrderContext from "#context/PlaceOrderContext"
import { usePaymentMethod } from "#hooks/usePaymentMethod"
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
  const [loading, setLoading] = useState(true)
  const [paymentSelected, setPaymentSelected] = useState("")
  const [paymentSourceCreated, setPaymentSourceCreated] = useState(false)
  const loadingResourceRef = useRef(false)

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
  useEffect(() => {
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
  ])
  useEffect(() => {
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
    if (showLoader && status) {
      if (status.toLowerCase() === "declined") {
        setLoading(false)
      } else {
        setLoading(true)
      }
    } else {
      setLoading(false)
    }
    // @ts-expect-error no type
  }, [showLoader, order?.payment_source?.payment_response?.status])
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
  const content = !loading ? <>{components}</> : getLoaderComponent(loader)

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
