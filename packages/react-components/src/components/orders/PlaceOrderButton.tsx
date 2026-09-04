/** biome-ignore-all lint/correctness/useExhaustiveDependencies: Avoid infinite loop */
import type { Order } from "@commercelayer/sdk"
import {
  type JSX,
  type MouseEvent,
  type ReactNode,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react"
import OrderContext from "#context/OrderContext"
import PaymentMethodContext from "#context/PaymentMethodContext"
import PlaceOrderContext from "#context/PlaceOrderContext"
import useCommerceLayer from "#hooks/useCommerceLayer"
import { usePlaceOrder } from "#hooks/usePlaceOrder"
import type { PlaceOrderOptions } from "#reducers/PlaceOrderReducer"
import type { BaseError } from "#typings/errors"
import type { ChildrenFunction } from "#typings/index"
import getCardDetails from "#utils/getCardDetails"
import { isAdyenAuthorizedResultCode, isRefusedPaymentResponse } from "#utils/paymentAuthorization"
import { checkPaymentIntent } from "#utils/stripe/retrievePaymentIntent"
import Parent from "../utils/Parent"

interface ChildrenProps extends Omit<Props, "children"> {
  /**
   * Callback function to place the order
   */
  handleClick: () => Promise<void>
}

interface Props extends Omit<JSX.IntrinsicElements["button"], "children" | "onClick"> {
  children?: ChildrenFunction<ChildrenProps>
  /**
   * The label of the button
   */
  label?: string | ReactNode | (() => ReactNode)
  /**
   * The label of the button when it's loading
   */
  loadingLabel?: string | ReactNode
  /**
   * If false, the button doesn't place the order automatically. Default: true
   */
  autoPlaceOrder?: boolean
  /**
   * Callback function that is fired when the button is clicked
   */
  onClick?: (response: { placed: boolean; order?: Order; errors?: BaseError[] }) => void
  /**
   * Place order options (PayPal, Adyen, Stripe, Checkout.com redirect flows).
   * Required in standalone mode when used without `<PlaceOrderContainer>`.
   */
  options?: PlaceOrderOptions
}

export function PlaceOrderButton(props: Props): JSX.Element {
  const ref = useRef(null)
  /** Order id we already fired one automatic place attempt for. */
  const autoPlaceAttemptedRef = useRef<string | null>(null)
  /** Order id a place attempt is currently in flight for. */
  const placeInFlightRef = useRef<string | null>(null)
  const {
    children,
    label = "Place order",
    loadingLabel = "Placing...",
    autoPlaceOrder = true,
    disabled,
    onClick,
    options: optionsProp,
    ...p
  } = props

  // Detect standalone mode: no <PlaceOrderContainer> parent has set _isProvided.
  const parentCtx = useContext(PlaceOrderContext)
  const isStandalone = parentCtx._isProvided !== true

  // Always call the hook (Rules of Hooks). When not standalone, effects are
  // guarded internally and the returned value is not used.
  const standaloneCtx = usePlaceOrder({ isStandalone, options: optionsProp })

  const {
    isPermitted,
    setPlaceOrder,
    options,
    paymentType,
    setButtonRef,
    setPlaceOrderStatus,
    status,
  } = isStandalone ? standaloneCtx : parentCtx
  const [notPermitted, setNotPermitted] = useState(true)
  const [forceDisable, setForceDisable] = useState(disabled)
  const [isLoading, setIsLoading] = useState(false)
  const [hasBlockingErrors, setHasBlockingErrors] = useState(false)
  const { sdkClient } = useCommerceLayer()
  const {
    currentPaymentMethodRef,
    loading,
    currentPaymentMethodType,
    paymentSource,
    setPaymentSource,
    setPaymentMethodErrors,
    currentCustomerPaymentSourceId,
    errors: paymentMethodErrors,
  } = useContext(PaymentMethodContext)
  const { order, setOrderErrors, errors } = useContext(OrderContext)
  const isFree = order?.total_amount_with_taxes_cents === 0
  useEffect(() => {
    if (hasBlockingErrors) {
      setNotPermitted(true)
      return () => {
        setNotPermitted(true)
      }
    }
    // NOTE: no `isFree && !isPermitted` shortcut here. It used to live at this
    // spot but was dead code: `setNotPermitted` is a state setter, so the
    // branches below ran in the same effect pass and always overwrote it.
    if (loading) setNotPermitted(loading)
    else {
      if (paymentType === currentPaymentMethodType && paymentType) {
        const paymentSourceStatus =
          // @ts-expect-error no type
          order?.payment_source?.payment_response?.status?.toLowerCase?.()
        const card = getCardDetails({
          customerPayment: {
            payment_source: paymentSource,
          },
          paymentType,
        })
        if (
          currentCustomerPaymentSourceId != null &&
          paymentSource?.id === currentCustomerPaymentSourceId &&
          card.brand === ""
        ) {
          // Force creadit card icon for customer payment source imported by API
          card.brand = "credit-card"
        }
        if (
          ((isFree && isPermitted) || currentPaymentMethodRef?.current?.onsubmit || card.brand) &&
          isPermitted
        ) {
          setNotPermitted(false)
        }
        if (!currentPaymentMethodRef?.current?.onsubmit && paymentSourceStatus === "declined") {
          setNotPermitted(true)
        }
      } else if (isFree && isPermitted) {
        setNotPermitted(false)
      } else {
        setNotPermitted(true)
      }
    }
    return () => {
      setNotPermitted(true)
    }
  }, [
    isPermitted,
    paymentType != null,
    !currentPaymentMethodRef?.current?.onsubmit,
    loading,
    currentPaymentMethodType,
    order?.id,
    paymentSource?.id,
    order?.total_amount_with_taxes_cents,
    hasBlockingErrors,
  ])
  useEffect(() => {
    const giftCardCouponFields = ["gift_card_code", "coupon_code", "gift_card_or_coupon_code"]
    const blockingErrors = errors?.filter((e) => !giftCardCouponFields.includes(e.field ?? ""))
    const hasErrors =
      (blockingErrors != null && blockingErrors.length > 0) ||
      (paymentMethodErrors != null && paymentMethodErrors.length > 0)
    setHasBlockingErrors(hasErrors)
    if (hasErrors) {
      setNotPermitted(true)
      setIsLoading(false)
      setForceDisable(false)
    }
  }, [errors?.length, paymentMethodErrors?.length])
  useEffect(() => {
    // PayPal redirect flow
    if (
      paymentType === "paypal_payments" &&
      options?.paypalPayerId &&
      order?.status &&
      ["draft", "pending"].includes(order?.status) &&
      autoPlaceOrder
    ) {
      handleClick()
    }
  }, [options?.paypalPayerId, paymentType != null])
  useEffect(() => {
    // Stripe redirect flow
    if (
      paymentType === "stripe_payments" &&
      options?.stripe?.paymentIntentClientSecret &&
      // @ts-expect-error no type
      order?.payment_source?.publishable_key &&
      order?.status &&
      ["draft", "pending"].includes(order?.status) &&
      autoPlaceOrder
    ) {
      // @ts-expect-error no type
      const publicApiKey = order?.payment_source?.publishable_key
      const paymentIntentClientSecret = options?.stripe?.paymentIntentClientSecret

      const getPaymentIntent = async (): Promise<void> => {
        const paymentIntentResult = await checkPaymentIntent({
          publicApiKey,
          paymentIntentClientSecret,
        })
        switch (paymentIntentResult.status) {
          case "valid":
            handleClick()
            break
          case "processing":
            // Set a timeout to check the payment intent status again
            setTimeout(() => {
              getPaymentIntent()
            }, 1000)
            break
          case "invalid":
            setPaymentMethodErrors([
              {
                code: "PAYMENT_INTENT_AUTHENTICATION_FAILURE",
                resource: "payment_methods",
                field: currentPaymentMethodType,
                message: paymentIntentResult.message,
              },
            ])
            break
        }
      }
      getPaymentIntent()
    }
  }, [
    options?.stripe?.paymentIntentClientSecret != null,
    paymentType != null,
    order?.payment_source != null,
  ])
  useEffect(() => {
    // Adyen redirect flow
    if (order?.status == null || !["draft", "pending"].includes(order.status)) return
    if (paymentType !== "adyen_payments" || !autoPlaceOrder) return
    const paymentResponse =
      // @ts-expect-error no type
      order?.payment_source?.payment_response
    const paymentDetails =
      // @ts-expect-error no type
      order?.payment_source?.payment_request_details?.details != null
    // NOTE: truthiness, not `!= null`: integrators pass `redirectResult` as an
    // empty string when the shopper is *not* coming back from a redirect.
    if (options?.adyen?.redirectResult && !paymentDetails) {
      const attributes = {
        payment_request_details: {
          details: {
            redirectResult: options?.adyen?.redirectResult,
          },
        },
        _details: 1,
      }
      setPaymentSource({
        paymentSourceId: paymentSource?.id,
        paymentResource: "adyen_payments",
        attributes,
      }).then((res) => {
        // @ts-expect-error no type
        const resultCode: string = res?.payment_response?.resultCode
        // @ts-expect-error no type
        const errorCode = res?.payment_response?.errorCode
        // @ts-expect-error no type
        const message = res?.payment_response?.message
        if (isAdyenAuthorizedResultCode(resultCode)) {
          handleClick()
        } else if (errorCode != null) {
          setPaymentMethodErrors([
            {
              code: "PAYMENT_INTENT_AUTHENTICATION_FAILURE",
              resource: "payment_methods",
              field: currentPaymentMethodType,
              message,
            },
          ])
        }
      })
      return
    }
    /**
     * The payment is authorized but the order is still pending. We get here when
     * the details for this redirect were already submitted — the shopper reloaded
     * the return URL, came back to it later, or a first place attempt did not go
     * through. Retrying is what keeps the order from being stranded at
     * pending + authorized, so this must NOT be gated on the absence of
     * `redirectResult`: that parameter is still in the URL for the whole return.
     *
     * `isAuthorizedForThisOrder` is the guard that replaces it. A payment source
     * cloned from the customer's wallet carries the `payment_response` of the
     * order it was first used on, so an authorized-looking response is not by
     * itself proof that *this* order is paid. Either of two order-scoped signals
     * is: core reporting `payment_status === "authorized"`, or Adyen echoing this
     * order's number in `merchantReference`. The first covers merchants who
     * customize the merchant reference, which the reference check alone missed.
     */
    const isAuthorizedForThisOrder =
      order.payment_status === "authorized" ||
      (order.number != null && paymentResponse?.merchantReference?.includes(order.number) === true)
    if (
      isAdyenAuthorizedResultCode(paymentResponse?.resultCode) &&
      isAuthorizedForThisOrder &&
      // A place is already in flight; `status` returns to standby if it fails.
      status !== "placing" &&
      // One automatic attempt per order per page load: `handleClick` flips
      // `status`, which re-runs this effect.
      autoPlaceAttemptedRef.current !== order.id
    ) {
      autoPlaceAttemptedRef.current = order.id
      handleClick()
    }
  }, [
    order?.id,
    order?.status,
    order?.payment_status,
    order?.number,
    Boolean(options?.adyen?.redirectResult),
    paymentType,
    status,
    // @ts-expect-error no type
    order?.payment_source?.payment_response?.resultCode,
  ])
  useEffect(() => {
    if (
      order?.status === "placed" &&
      order?.payment_status === "authorized" &&
      paymentType === "adyen_payments"
    ) {
      // Dispatch the onClick callback when the order is placed and the payment status is authorized (Adyen with gift card)
      onClick?.({
        placed: true,
        order: order,
      })
    }
  }, [order?.id, order?.payment_status, order?.status, paymentType != null])
  useEffect(() => {
    // Checkout.com redirect flow
    if (
      paymentType === "checkout_com_payments" &&
      options?.checkoutCom?.session_id &&
      order?.status &&
      ["draft", "pending"].includes(order?.status) &&
      autoPlaceOrder
    ) {
      // @ts-expect-error no type
      const paymentResponse = order?.payment_source?.payment_response
      const paymentStatus = paymentResponse?.status
      if (paymentStatus && paymentStatus.toLowerCase() === "pending") {
        async function placingOrder(): Promise<void> {
          const res = await setPaymentSource({
            paymentSourceId: paymentSource?.id,
            paymentResource: "checkout_com_payments",
            attributes: {
              _details: 1,
            },
          })
          // @ts-expect-error no type
          const paymentStatus: string = res?.payment_response?.status
          const isValidStatus = ["authorized", "captured"].includes(paymentStatus?.toLowerCase())
          if (paymentStatus && isValidStatus) {
            handleClick()
          } else {
            if (options?.checkoutCom) {
              options.checkoutCom.session_id = undefined
            }
            setPaymentMethodErrors([
              {
                code: "PAYMENT_INTENT_AUTHENTICATION_FAILURE",
                resource: "payment_methods",
                field: currentPaymentMethodType,
                message: paymentStatus,
              },
            ])
          }
        }
        placingOrder()
      }
    } else if (
      paymentType === "checkout_com_payments" &&
      order?.status &&
      status &&
      ["pending"].includes(order?.status) &&
      ["placing"].includes(status) &&
      autoPlaceOrder
    ) {
      /**
       * Place order with Checkout.com using express payments
       */
      const paymentSourceStatus =
        // @ts-expect-error no type
        order?.payment_source?.payment_response?.status
      if (
        paymentSourceStatus &&
        ["captured", "authorized"].includes(paymentSourceStatus.toLowerCase())
      ) {
        setPlaceOrder?.({
          paymentSource,
        }).then((placed) => {
          if (placed?.placed) {
            onClick?.(placed)
            setPlaceOrderStatus?.({ status: "placing" })
          } else {
            setPlaceOrderStatus?.({ status: "standby" })
          }
        })
      }
    }
  }, [options?.checkoutCom?.session_id, order?.payment_source?.id, status])
  useEffect(() => {
    if (ref?.current != null && setButtonRef != null) {
      setButtonRef(ref)
    }
  }, [ref?.current])
  useEffect(() => {
    switch (status) {
      case "disabled":
      case "placing":
        setNotPermitted(true)
        break
      // No default — the payment check effect above is the sole authority for enabling
      // the button. Enabling unconditionally here (old default case) caused the button
      // to be enabled on mount regardless of whether a payment method was selected.
    }
  }, [status])
  const placeOrderAttempt = async (): Promise<void> => {
    const sdk = sdkClient()
    if (sdk == null) return
    if (order == null) return
    let isValid = true
    let currentPaymentStatus = "unpaid"

    const isStripePayment = paymentType === "stripe_payments"
    if (!isStripePayment) {
      /**
       * Check if the order is already placed or in draft status to avoid placing it again
       * and to prevent placing a draft order
       * @see https://docs.commercelayer.io/core/how-tos/placing-orders/checkout/placing-the-order
       */
      const { status, payment_status: paymentStatus } = await sdk.orders.retrieve(order?.id, {
        fields: ["status", "payment_status", "payment_source"],
        include: ["payment_source"],
      })
      const isAlreadyPlaced = status === "placed"
      const isDraftOrder = status === "draft"
      currentPaymentStatus = paymentStatus ?? "unpaid"

      if (isAlreadyPlaced) {
        /**
         * Order already placed
         */
        setPlaceOrderStatus?.({ status: "placing" })
        onClick?.({
          placed: true,
          order: order,
        })
        return
      }
      if (isDraftOrder) {
        /**
         * Draft order cannot be placed
         */
        setPlaceOrderStatus?.({ status: "standby" })
        onClick?.({
          placed: false,
          order: order,
          errors: [
            {
              code: "VALIDATION_ERROR",
              resource: "orders",
              message: "Draft order cannot be placed",
            },
          ],
        })
        setOrderErrors([
          {
            code: "VALIDATION_ERROR",
            resource: "orders",
            message: "Draft order cannot be placed",
          },
        ])
        return
      }
    }
    setIsLoading(true)
    // setForceDisable(true)
    const checkPaymentSource =
      paymentType !== "stripe_payments"
        ? await setPaymentSource({
            // @ts-expect-error no type not be undefined
            paymentResource: paymentType,
            paymentSourceId: paymentSource?.id,
          })
        : // Fall back to the order's own payment source: on a 3DS return the
          // Stripe redirect effect above fires as soon as `order.payment_source`
          // is there, which can be before `PaymentMethodContext` has hydrated
          // `paymentSource`. Without the fallback `(checkPaymentSource || isFree)`
          // was false and the order was silently never placed.
          (paymentSource ?? (order?.payment_source as typeof paymentSource))
    const checkPaymentSourceStatus =
      // @ts-expect-error no type
      checkPaymentSource?.payment_response?.status?.toLowerCase?.()
    const card =
      paymentType &&
      getCardDetails({
        paymentType,
        customerPayment: { payment_source: checkPaymentSource },
      })
    /**
     * Coming back from a payment redirect (PayPal, Adyen 3DS/APM, Checkout.com,
     * Stripe 3DS) the shopper has already authorized the payment, and re-running
     * the gateway widget's `onsubmit` here would start a *second* payment attempt.
     * Worse, every widget reports failure from that second attempt — Adyen's
     * `handleSubmit` always returns `false`, Stripe's `confirmPayment` rejects an
     * intent that already succeeded — which left `isValid === false` and the order
     * stranded at pending + authorized. Skip the widget and go straight to placing.
     *
     * NOTE: truthiness, not `!= null`. Integrators pass every one of these options
     * as an empty string when the shopper is not returning from a redirect, so a
     * null check here would skip the widget on the *normal* flow and nothing would
     * ever be placed.
     */
    const isReturningFromRedirect = Boolean(
      options?.paypalPayerId ||
        options?.adyen?.MD ||
        options?.adyen?.redirectResult ||
        options?.checkoutCom?.session_id ||
        options?.stripe?.paymentIntentClientSecret
    )
    if (currentPaymentMethodRef?.current?.onsubmit && !isReturningFromRedirect) {
      isValid = (await currentPaymentMethodRef.current?.onsubmit({
        // @ts-expect-error no type
        paymentSource: checkPaymentSource,
        setPlaceOrder,
        onclickCallback: onClick,
      })) as boolean
      if (
        !isValid &&
        isAdyenAuthorizedResultCode(
          // @ts-expect-error no type
          checkPaymentSource?.payment_response?.resultCode
        )
      ) {
        isValid = true
      }
    } else if (
      currentPaymentMethodRef?.current?.onsubmit &&
      options?.checkoutCom?.session_id &&
      // @ts-expect-error no type
      checkPaymentSource?.payment_response?.status &&
      // @ts-expect-error no type
      checkPaymentSource?.payment_response?.status?.toLowerCase() === "declined"
    ) {
      /**
       * Permit to place order with declined payment using Checkout.com
       */
      isValid = (await currentPaymentMethodRef.current?.onsubmit({
        // @ts-expect-error no type
        paymentSource: checkPaymentSource,
        setPlaceOrder,
        onclickCallback: onClick,
      })) as boolean
    } else if (isReturningFromRedirect) {
      /**
       * We skipped the widget's own validation above, so nothing has vetted this
       * payment inside the component. Refuse only on an explicit negative signal
       * from the gateway: methods that report nothing here (PayPal, Stripe — whose
       * intent the redirect effect already verified — wire transfers) must stay
       * placeable, and a refused redirect must not be placed just because we no
       * longer re-submit it.
       *
       * Checkout.com is exempt: placing an order whose payment was declined is a
       * deliberate feature there (unpaid orders), owned by the branch above.
       */
      if (!options?.checkoutCom?.session_id && isRefusedPaymentResponse(checkPaymentSource)) {
        isValid = false
      }
    } else if (card?.brand && checkPaymentSourceStatus !== "declined") {
      isValid = true
    }
    if (currentPaymentStatus === "partially_authorized") {
      isValid = false
    }
    if (isValid && setPlaceOrderStatus != null) {
      setPlaceOrderStatus({ status: "placing" })
      setForceDisable(true)
    }
    const placed =
      isValid &&
      setPlaceOrder &&
      (checkPaymentSource || isFree) &&
      (await setPlaceOrder({
        paymentSource: checkPaymentSource,
        currentCustomerPaymentSourceId,
      }))
    if (placed && setPlaceOrderStatus != null) {
      if (placed.placed) {
        setPlaceOrderStatus({ status: "placing" })
        onClick?.(placed)
      } else {
        setForceDisable(false)
        onClick?.(placed)
        setIsLoading(false)
        setPlaceOrderStatus({ status: "standby" })
      }
    } else {
      setIsLoading(false)
      setPlaceOrderStatus?.({ status: "standby" })
    }
  }
  /**
   * Serialises place attempts, one per order.
   *
   * Both status checks in `placeOrderAttempt` are async, so two callers racing
   * each other read the order as still `pending` and place it twice: the
   * automatic redirect effect above, and the programmatic click the gateway
   * widget fires once it has authorized the payment. A second place repeats
   * every side effect of `setPlaceOrder`, `_save_billing_address_to_customer_
   * address_book` included, which leaves the shopper with the same address
   * twice in their wallet.
   */
  const handleClick = async (e?: MouseEvent<HTMLButtonElement>): Promise<void> => {
    e?.preventDefault()
    e?.stopPropagation()
    if (order == null) return
    if (placeInFlightRef.current === order.id) return
    placeInFlightRef.current = order.id
    try {
      await placeOrderAttempt()
    } finally {
      // Reopened on purpose. An attempt that did not place must stay retryable
      // by an explicit click; one that did is stopped by the already-placed
      // checks in `placeOrderAttempt` and `setPlaceOrder` instead.
      placeInFlightRef.current = null
    }
  }
  const disabledButton = disabled !== undefined ? disabled : notPermitted
  const labelButton = isLoading ? loadingLabel : typeof label === "function" ? label() : label
  const parentProps = {
    ...p,
    label,
    disabled: disabledButton,
    handleClick,
    parentRef: ref,
    isLoading,
  }
  return children ? (
    <Parent {...parentProps}>{children}</Parent>
  ) : (
    <button
      ref={ref}
      type="button"
      disabled={disabledButton || forceDisable}
      onClick={(e) => {
        handleClick(e)
      }}
      {...p}
    >
      {labelButton}
    </button>
  )
}

export default PlaceOrderButton
