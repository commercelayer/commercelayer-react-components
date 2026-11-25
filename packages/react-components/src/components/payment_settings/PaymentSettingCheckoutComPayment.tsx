import {
  type CardComponentOptions,
  type CheckoutError,
  type Component,
  loadCheckoutWebComponents,
  type Options,
} from "@checkout.com/checkout-web-components"
import {
  CHECKOUT_COM_SETTING_TYPE,
  readCheckoutComPaymentSession,
  recordCheckoutComPayment,
} from "@commercelayer/core-components"
import type { PaymentSession } from "@commercelayer/sdk"
import { type JSX, useContext, useEffect, useRef, useState } from "react"
import Parent from "#components/utils/Parent"
import CommerceLayerContext from "#context/CommerceLayerContext"
import OrderContext from "#context/OrderContext"
import PaymentSettingChildrenContext from "#context/PaymentSettingChildrenContext"
import { usePaymentSettingLoader } from "#hooks/usePaymentSettingLoader"
import { useStickySessionValue } from "#hooks/useStickySessionValue"
import type { BaseError } from "#typings/errors"
import type { ChildrenFunction, LoaderType } from "#typings/index"
import {
  type PaymentGatewaySubmitResult,
  registerHostCollection,
  setCollecting,
  setCollectionReady,
} from "#utils/paymentGatewayStore"

/**
 * The options this component owns, because the Payment Gateway Handoff depends
 * on them: the pay button is `<PlaceOrderButton>`, and the outcome has to reach
 * it through these callbacks.
 */
type OwnedCardOption =
  | "showPayButton"
  | "onReady"
  | "onChange"
  | "onSubmit"
  | "onPaymentCompleted"
  | "onError"
  | "handleSubmit"
  | "handleClick"

export interface PaymentSettingCheckoutComPaymentChildrenProps {
  /** Whether the card form is on screen. Not `isReady`, which says it is filled in. */
  isLoaded: boolean
  /** Whether the card form holds everything a payment needs. */
  isReady: boolean
  /** A payment is in flight, started by `<PlaceOrderButton>`. */
  isSubmitting: boolean
  /**
   * Checkout.com's own code for the last refusal — `payment_request_declined`,
   * or the decline reason it gave, such as `not_enough_funds`. No message: a
   * package cannot know the checkout's language, and the card form has already
   * shown its own.
   */
  lastErrorCode?: string
  errors: BaseError[]
}

interface Props {
  children?: ChildrenFunction<PaymentSettingCheckoutComPaymentChildrenProps>
  /**
   * Options for Checkout.com's web components: `appearance`, `locale`,
   * `translations`, `componentOptions`. The public key, the payment session and
   * the environment come from the setting and the Payment Session.
   */
  options?: Omit<Options, "publicKey" | "paymentSession" | "environment">
  /**
   * Options for the card component, such as `displayCardholderName` or
   * `acceptedCardSchemes`. The callbacks and `showPayButton` are this
   * component's: see `OwnedCardOption`.
   */
  cardOptions?: Omit<CardComponentOptions, OwnedCardOption>
  /** Class on the element the card form mounts into. */
  containerClassName?: string
  /**
   * Shown until the card form has painted, in place of `<PaymentSetting>`'s
   * `loader` for this setting.
   */
  loader?: LoaderType
}

/**
 * Checkout.com's card form for an order on the `payment_sessions` model.
 *
 * Mounted inside `<PaymentSetting>`, which renders it once per available
 * setting; this returns `null` for every setting that is not Checkout.com's, so
 * a checkout mounts it once and does not branch.
 *
 * **The card component, not Flow.** Flow would also offer whatever else the
 * Checkout.com account has on — Apple Pay, Google Pay, PayPal, local methods —
 * and those come with a pay button of their own, which `<PlaceOrderButton>`
 * cannot press. The card component has none, so the place-order button stays
 * the only way to pay, and the order the money is taken in stays ours: gift
 * cards first, then the card.
 *
 * **`<PlaceOrderButton>` is the pay button.** The card form is mounted with
 * `showPayButton: false` and registers a **host collection** on the Payment
 * Gateway Handoff, which calls the component's `submit()`. Checkout.com then
 * submits the payment itself, and the API only learns of it when the payment id
 * is written into the session: an approved payment is recorded before the
 * collection reports `completed`, so the authorization the place sequence
 * creates reads that payment instead of submitting a new one.
 *
 * 3DS runs in place when Checkout.com can and on the issuer's page when it
 * cannot. A redirect leaves the page with the collection still pending, and
 * `<PaymentSetting>` picks the return up on the next load.
 */
export function PaymentSettingCheckoutComPayment(props: Props): JSX.Element | null {
  const { children } = props
  const { setting, currentPaymentSession, isSelected, isPending, readonly } = useContext(
    PaymentSettingChildrenContext
  )
  const loader = usePaymentSettingLoader(props.loader)

  const isCheckoutCom = setting?.type === CHECKOUT_COM_SETTING_TYPE
  const publicKey = (setting as { public_key?: string | null } | undefined)?.public_key
  const paymentSession = useStickySessionValue(currentPaymentSession, readCheckoutComPaymentSession)

  /**
   * Only the selected setting's form is live: `<PaymentSetting>` renders its
   * children once per setting, and every mounted form would otherwise register
   * a collection for an order paying some other way.
   */
  const shouldMount = isCheckoutCom && isSelected === true && readonly !== true

  if (!isCheckoutCom) return null
  if (
    !shouldMount ||
    publicKey == null ||
    publicKey === "" ||
    paymentSession == null ||
    currentPaymentSession == null
  ) {
    // The Payment Session is being created for this setting: the first half
    // of the wait, before there is anything to mount.
    const placeholder = isPending === true && readonly !== true ? loader : null
    return (
      <>
        {placeholder}
        {children != null ? (
          <Parent
            {...{ ...props, isLoaded: false, isReady: false, isSubmitting: false, errors: [] }}
          >
            {children}
          </Parent>
        ) : null}
      </>
    )
  }

  return (
    // Keyed on Checkout.com's payment session: a component is built from one
    // and cannot be moved to another, so a replaced Payment Session — a new
    // save-card choice, or one discarded after a refusal — needs a new form.
    <CheckoutComCard
      key={String((paymentSession as { id?: unknown }).id)}
      {...props}
      publicKey={publicKey}
      paymentSession={paymentSession}
      currentPaymentSession={currentPaymentSession}
      loader={loader}
    />
  )
}

interface CardProps extends Omit<Props, "loader"> {
  publicKey: string
  paymentSession: Record<string, unknown>
  currentPaymentSession: PaymentSession
  loader: JSX.Element | null
}

/** Settles the collection `<PlaceOrderButton>` is waiting on. */
type Settle = (result: PaymentGatewaySubmitResult) => void

/** The half that owns the mounted card component. */
function CheckoutComCard({
  children,
  options,
  cardOptions,
  containerClassName,
  publicKey,
  paymentSession,
  currentPaymentSession,
  loader,
}: CardProps): JSX.Element {
  const { order } = useContext(OrderContext)
  const { accessToken, interceptors } = useContext(CommerceLayerContext)
  const orderId = order?.id

  const containerRef = useRef<HTMLDivElement>(null)
  const componentRef = useRef<Component | null>(null)
  /** The settle function of the payment in flight, if one is. */
  const settleRef = useRef<Settle | null>(null)
  /**
   * A payment Checkout.com approved and the API was not told about. Retried
   * instead of submitting again: the money is already taken, and a second
   * `submit()` would take it twice.
   */
  const approvedRef = useRef<string | null>(null)

  const [isLoaded, setIsLoaded] = useState(false)
  // The card form never paints after this, so the loader stops on it too.
  const [hasLoadFailed, setHasLoadFailed] = useState(false)
  const [isReady, setIsReady] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [errors, setErrors] = useState<BaseError[]>([])
  const [lastErrorCode, setLastErrorCode] = useState<string | undefined>(undefined)

  // The current values, for callbacks registered once and called much later.
  const latestRef = useRef({ accessToken, interceptors, currentPaymentSession })
  latestRef.current = { accessToken, interceptors, currentPaymentSession }

  /** Tell the API which payment pays the session, then settle `completed`. */
  const record = async (paymentId: string): Promise<PaymentGatewaySubmitResult> => {
    const {
      accessToken: token,
      interceptors: requestInterceptors,
      currentPaymentSession: session,
    } = latestRef.current
    approvedRef.current = paymentId
    try {
      if (token == null) throw new Error("No access token to record the payment with.")
      await recordCheckoutComPayment({
        accessToken: token,
        interceptors: requestInterceptors,
        paymentSessionId: session.id,
        clientData: session.client_data as Record<string, unknown> | null | undefined,
        paymentId,
      })
      approvedRef.current = null
      return { status: "completed" }
    } catch (error) {
      // The money is taken and the API does not know it: an unknown outcome,
      // which nothing may roll back. The next click retries the write.
      const code = "payment_not_recorded"
      setLastErrorCode(code)
      setErrors([
        gatewayError(
          error instanceof Error && error.message !== ""
            ? error.message
            : "The payment could not be recorded.",
          code
        ),
      ])
      return { status: "unknown", code }
    }
  }

  // Mount once per Checkout.com payment session, which the parent keys this
  // component on. Everything the callbacks read comes from refs, so options
  // changing identity on every render of the application does not rebuild the
  // form and lose what the shopper typed.
  // biome-ignore lint/correctness/useExhaustiveDependencies: see above
  useEffect(() => {
    const container = containerRef.current
    if (container == null) return
    let cancelled = false
    let component: Component | null = null

    const settle = (result: PaymentGatewaySubmitResult): void => {
      const pending = settleRef.current
      settleRef.current = null
      pending?.(result)
    }

    void (async () => {
      try {
        const checkout = await loadCheckoutWebComponents({
          ...options,
          publicKey,
          paymentSession,
          environment: isSandboxKey(publicKey) ? "sandbox" : "production",
        })
        if (cancelled) return
        component = checkout.create("card", {
          ...cardOptions,
          showPayButton: false,
          onReady: () => {
            setIsLoaded(true)
          },
          onChange: (changed) => {
            const valid = changed.isValid()
            setIsReady(valid)
            setCollectionReady(orderId, valid)
          },
          onPaymentCompleted: (_component, payment) => {
            if (settleRef.current == null) return
            void record(payment.id).then(settle)
          },
          onError: (_component, error) => {
            if (settleRef.current == null) {
              // Not a payment of ours: a failure to load or render. Submit
              // errors land here too when validation was shown on purpose.
              if (error.type !== "Submit") {
                setHasLoadFailed(true)
                setErrors([gatewayError(error.message, error.code)])
              }
              return
            }
            const result = submitResult(error)
            if (result.status === "failed" || result.status === "unknown") {
              setLastErrorCode(result.code)
              setErrors([gatewayError(error.message, result.code)])
            }
            settle(result)
          },
        })
        // Required before mounting any component other than Flow.
        if (!(await component.isAvailable())) {
          throw new Error("Checkout.com's card component is not available.")
        }
        if (cancelled) return
        component.mount(container)
        componentRef.current = component
      } catch (error) {
        if (cancelled) return
        setHasLoadFailed(true)
        setErrors([
          gatewayError(
            error instanceof Error ? error.message : "Checkout.com could not be loaded.",
            "load_failed"
          ),
        ])
      }
    })()

    return () => {
      cancelled = true
      componentRef.current = null
      // A payment still in flight when the form goes away has an unknown
      // outcome, and the button must not wait on it forever.
      settle({ status: "unknown", code: "component_unmounted" })
      try {
        component?.unmount()
      } catch {
        // Never mounted, or already gone.
      }
    }
  }, [])

  // A deliberate trigger set: the callback reads everything else from refs, so
  // it is registered once per order rather than on every render.
  // biome-ignore lint/correctness/useExhaustiveDependencies: see above
  useEffect(() => {
    return registerHostCollection(orderId, async (): Promise<PaymentGatewaySubmitResult> => {
      // Approved earlier and never recorded: record it, and take nothing more.
      if (approvedRef.current != null) {
        setIsSubmitting(true)
        try {
          return await record(approvedRef.current)
        } finally {
          setIsSubmitting(false)
        }
      }

      const component = componentRef.current
      if (component == null) return { status: "incomplete" }
      if (!component.isValid()) {
        // Submitting an incomplete form makes the card component show which
        // fields are missing, and raises a Submit error nobody is waiting on.
        // Nothing for the application to report: this is a stop.
        component.submit()
        return { status: "incomplete" }
      }

      setErrors([])
      setLastErrorCode(undefined)
      setIsSubmitting(true)
      // Checkout.com owns the shopper from here — a 3DS challenge, possibly a
      // redirect — and the Payment Session records none of it until the
      // payment id is written. Nothing may delete that session in the meantime.
      setCollecting(orderId, true)
      try {
        const outcome = new Promise<PaymentGatewaySubmitResult>((resolve) => {
          settleRef.current = resolve
        })
        component.submit()
        return await outcome
      } finally {
        settleRef.current = null
        setIsSubmitting(false)
        setCollecting(orderId, false)
      }
    })
  }, [orderId])

  const parentProps = { isLoaded, isReady, isSubmitting, lastErrorCode, errors }

  return (
    <>
      {/* Beside the form, never instead of it: the component mounts into its
          own node, which has to be in the DOM for it to ever be ready. */}
      {!isLoaded && !hasLoadFailed ? loader : null}
      <div ref={containerRef} className={containerClassName} />
      {children != null ? <Parent {...parentProps}>{children}</Parent> : null}
    </>
  )
}

/**
 * What a Checkout.com error means for the payment in flight.
 *
 * - **Submit:** the form was not complete. A stop, shown by the form itself.
 * - **Declined or aborted:** a verdict, so no money moved. The code is the
 *   decline reason Checkout.com gave, when it gave one.
 * - **Everything else** — a network failure, a request that failed midway —
 *   leaves the outcome unknown: the payment may have reached Checkout.com.
 */
function submitResult(error: CheckoutError): PaymentGatewaySubmitResult {
  if (error.type === "Submit") return { status: "incomplete" }
  if (error.type === "Request") {
    if (error.code === "payment_request_declined") {
      const [reason] = error.details.requestErrorCodes ?? []
      return { status: "failed", code: reason ?? error.code }
    }
    if (error.code === "payment_request_aborted") {
      return { status: "failed", code: error.details.abortReason ?? error.code }
    }
  }
  return { status: "unknown", code: error.code }
}

/**
 * Checkout.com's keys say which environment they belong to: `pk_sbox_` for the
 * sandbox, and `pk_test_` on accounts older than that convention.
 */
function isSandboxKey(publicKey: string): boolean {
  return publicKey.startsWith("pk_sbox_") || publicKey.startsWith("pk_test_")
}

/**
 * A refusal carrying Checkout.com's own code, tagged `orders`: `<Errors>`
 * matches on `resource`, and the place-order button writes what it gets from
 * the handoff into the order's error state.
 */
function gatewayError(message: string | undefined, code: string): BaseError {
  return {
    code: "VALIDATION_ERROR",
    resource: "orders",
    message: message ?? "The payment was not completed.",
    meta: { error: code },
  }
}

export default PaymentSettingCheckoutComPayment
