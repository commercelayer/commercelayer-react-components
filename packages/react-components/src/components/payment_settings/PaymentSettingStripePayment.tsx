import { readStripeClientSecret, STRIPE_SETTING_TYPE } from "@commercelayer/core-components"
import type { PaymentSession } from "@commercelayer/sdk"
import { Elements, PaymentElement, useElements, useStripe } from "@stripe/react-stripe-js"
import {
  loadStripe,
  type Stripe,
  type StripePaymentElementChangeEvent,
  type StripePaymentElementOptions,
} from "@stripe/stripe-js"
import { type JSX, useContext, useEffect, useMemo, useRef, useState } from "react"
import Parent from "#components/utils/Parent"
import OrderContext from "#context/OrderContext"
import PaymentSettingChildrenContext from "#context/PaymentSettingChildrenContext"
import type { BaseError } from "#typings/errors"
import type { ChildrenFunction } from "#typings/index"
import {
  type PaymentGatewaySubmitResult,
  registerHostCollection,
  setCollectionReady,
} from "#utils/paymentGatewayStore"

/**
 * PaymentIntent statuses that mean the money is there, as far as this checkout
 * is concerned.
 *
 * `requires_capture` and not only `succeeded`, because Commerce Layer creates
 * the intent with `capture_method: 'manual'` unless the setting captures
 * automatically — so a successful authorization lands there and never reaches
 * `succeeded` until something captures it. `core-api` agrees:
 * `Payment::Session::Stripe::ACTION_STATES[:succeed][:authorization]` is
 * `%w(requires_capture succeeded)`.
 *
 * `processing` is included for the reason `Pending` is on the Adyen path: Stripe
 * has accepted and is waiting, the authorization settles on a webhook, and
 * `placeOrderWithPaymentSessions` already polls for exactly that.
 */
const MONEY_TAKEN_INTENT_STATUSES = ["succeeded", "requires_capture", "processing"] as const

/**
 * PaymentIntent statuses that mean this attempt is over and nothing was taken.
 *
 * A **verdict**, so a rollback is safe — the distinction the handoff draws
 * between `failed` and `unknown`. `requires_payment_method` is Stripe's way of
 * saying the payment was refused and the intent is waiting for another attempt.
 */
const REFUSED_INTENT_STATUSES = ["requires_payment_method", "canceled"] as const

/**
 * Stripe error types that are verdicts rather than unknown outcomes.
 *
 * `card_error` is a refusal Stripe has already told the shopper about, and no
 * money moved. Everything else — `api_error`, `api_connection_error`,
 * `authentication_error`, `rate_limit_error`, `invalid_request_error` — leaves
 * the outcome genuinely unknown: the confirmation may have reached Stripe.
 */
const VERDICT_ERROR_TYPES = ["card_error"] as const

const defaultOptions: StripePaymentElementOptions = { layout: "tabs" }

export interface PaymentSettingStripePaymentChildrenProps {
  /** Whether the Payment Element has a complete method ready to confirm. */
  isReady: boolean
  /** A confirmation is in flight, started by `<PlaceOrderButton>`. */
  isSubmitting: boolean
  /**
   * Stripe's own code for the last refusal — `card_declined`,
   * `insufficient_funds`, and so on — or the PaymentIntent status when the
   * refusal arrived as one. No message: a package cannot know the checkout's
   * language, and Stripe has already shown its own inside the Element.
   */
  lastErrorCode?: string
  errors: BaseError[]
}

interface Props {
  children?: ChildrenFunction<PaymentSettingStripePaymentChildrenProps>
  /**
   * Options for Stripe's Payment Element. Defaults to `{ layout: "tabs" }`.
   *
   * Note what cannot be set here: **which methods are offered**. The Element is
   * driven by the PaymentIntent's client secret, so its methods come from the
   * intent — Commerce Layer sends no `payment_method_types`, which leaves it to
   * the Stripe Dashboard. `paymentMethodOrder` orders them; nothing filters
   * them. A merchant who wants cards only turns the rest off in Stripe.
   */
  options?: StripePaymentElementOptions
  /** Class on the element wrapping the Payment Element. */
  containerClassName?: string
}

/**
 * Stripe's Payment Element for an order on the `payment_sessions` model.
 *
 * Mounted inside `<PaymentSetting>`, which renders it once per available
 * setting; this returns `null` for every setting that is not Stripe's, so a
 * checkout mounts it once and does not branch.
 *
 * **`<PlaceOrderButton>` is the pay button.** The Element is inert until
 * something confirms it, so this registers a **host collection** on the Payment
 * Gateway Handoff and the button calls it — which is what keeps the
 * privacy-and-terms gate in front of every payment. Nothing here is a
 * Gateway-Owned Button: that is a property of a *method*, and the methods that
 * have their own (Apple Pay, Google Pay through Stripe) live in the Express
 * Checkout Element, not this one.
 *
 * Confirmation is `redirect: "if_required"`, so a 3DS challenge happens in place
 * and `confirmPayment` resolves with the outcome. A method that insists on a
 * redirect — Amazon Pay, and whatever else the Dashboard has on — navigates
 * away instead, and the return is picked up on the next page load.
 */
export function PaymentSettingStripePayment(props: Props): JSX.Element | null {
  const { children, options, containerClassName } = props
  const { setting, currentPaymentSession, isSelected, readonly } = useContext(
    PaymentSettingChildrenContext
  )

  const isStripe = setting?.type === STRIPE_SETTING_TYPE
  const publishableKey = (setting as { public_key?: string | null } | undefined)?.public_key
  const clientSecret = useStickyClientSecret(currentPaymentSession)

  /**
   * Only the selected setting's Element is live.
   *
   * `<PaymentSetting>` renders its children once per setting, so without this
   * every Stripe form on the page would register a collection and the
   * place-order button would believe Stripe is collecting for an order paying by
   * bank transfer. That mistake shipped once on the Adyen path.
   */
  const shouldMount = isStripe && isSelected === true && readonly !== true

  /**
   * `loadStripe` is memoised on the key, not called per render.
   *
   * It injects a script tag and returns a promise; a fresh call per render would
   * tear the Elements group down and rebuild it, losing whatever the shopper had
   * typed. Keyed on the publishable key so a setting swap does rebuild it.
   */
  const stripePromise = useMemo<Promise<Stripe | null> | null>(
    () => (publishableKey != null && publishableKey !== "" ? loadStripe(publishableKey) : null),
    [publishableKey]
  )

  if (!isStripe) return null
  if (!shouldMount || stripePromise == null || clientSecret == null) {
    // No form to show, but `children` still gets to render its chrome — a recap
    // line, or the reason a setting with no publishable key shows nothing.
    return children != null ? (
      <Parent {...{ ...props, isReady: false, isSubmitting: false, errors: [] }}>{children}</Parent>
    ) : null
  }

  return (
    <div className={containerClassName}>
      {/* Keyed on the secret: `options.clientSecret` is read when the group is
          created and ignored afterwards, so a session replaced after a refusal
          would otherwise leave the Element confirming the burnt intent. */}
      <Elements key={clientSecret} stripe={stripePromise} options={{ clientSecret }}>
        <StripeForm {...props} options={{ ...defaultOptions, ...options }} />
      </Elements>
    </div>
  )
}

/**
 * The client secret, remembered across a refetch that arrives without it.
 *
 * `response_data` is not in every consumer's `fields` allowlist, and a checkout
 * that refetches the order for its own reasons — after a gift card, say — can
 * hand this component a copy of the *same session* with the secret missing.
 * Read literally that means "no session", the Elements group unmounts, and the
 * card the shopper was halfway through typing is gone. It cost a test that
 * looked like a mistyped card number: only the first keystroke had survived.
 *
 * So a secret is kept until the **session** changes, which is the only thing
 * that actually invalidates it. A different session id drops it, because then
 * the old secret belongs to a payment that is no longer the selection.
 */
function useStickyClientSecret(session?: PaymentSession): string | undefined {
  const sessionId = session?.id
  const remembered = useRef<{ sessionId?: string; secret?: string }>({})
  const read = readStripeClientSecret(session)

  // Written during render on purpose: this is a cache of a value derived from
  // the props, not state anything renders from, and an effect would leave one
  // render showing no form at all — which is the unmount this exists to avoid.
  if (read != null) remembered.current = { sessionId, secret: read }
  else if (remembered.current.sessionId !== sessionId) remembered.current = {}

  return read ?? remembered.current.secret
}

/**
 * The half that needs Stripe's hooks, and therefore the `<Elements>` provider
 * above it.
 */
function StripeForm({
  children,
  options,
}: Props & { options: StripePaymentElementOptions }): JSX.Element {
  const stripe = useStripe()
  const elements = useElements()
  const { order } = useContext(OrderContext)
  const { returnUrl } = useContext(PaymentSettingChildrenContext)

  const [isReady, setIsReady] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [errors, setErrors] = useState<BaseError[]>([])
  const [lastErrorCode, setLastErrorCode] = useState<string | undefined>(undefined)

  const orderId = order?.id

  // The current values, for a `submit` registered once and called much later.
  const latestRef = useRef({ stripe, elements, returnUrl })
  latestRef.current = { stripe, elements, returnUrl }

  // A deliberate trigger set: everything the callback reads comes from
  // `latestRef`, so listing `stripe`/`elements` here would re-register the
  // collection on every keystroke the Element reports.
  // biome-ignore lint/correctness/useExhaustiveDependencies: see above
  useEffect(() => {
    return registerHostCollection(orderId, async (): Promise<PaymentGatewaySubmitResult> => {
      const { stripe: sdk, elements: group, returnUrl: url } = latestRef.current
      if (sdk == null || group == null) return { status: "incomplete" }

      // Stripe wants this before `confirmPayment` whenever the Element was
      // created with a client secret, and it is also where the Element shows
      // its own validation. So a failure here is a stop, not something for the
      // application to report.
      const { error: submitError } = await group.submit()
      if (submitError != null) return { status: "incomplete" }

      setErrors([])
      setIsSubmitting(true)
      try {
        const { error, paymentIntent } = await sdk.confirmPayment({
          elements: group,
          redirect: "if_required",
          confirmParams: {
            // Required by Stripe even with `if_required`, because whether a
            // redirect happens is decided by the method the shopper picked.
            return_url: url ?? window.location.href,
          },
        })

        if (error != null) {
          const code = error.code ?? error.decline_code ?? error.type
          setLastErrorCode(code)
          setErrors([gatewayError(error.message, code)])
          const isVerdict = VERDICT_ERROR_TYPES.includes(
            error.type as (typeof VERDICT_ERROR_TYPES)[number]
          )
          if (error.type === "validation_error") return { status: "incomplete" }
          return { status: isVerdict ? "failed" : "unknown", code }
        }

        const status = paymentIntent?.status
        if (
          status != null &&
          MONEY_TAKEN_INTENT_STATUSES.includes(
            status as (typeof MONEY_TAKEN_INTENT_STATUSES)[number]
          )
        ) {
          return { status: "completed" }
        }
        if (
          status != null &&
          REFUSED_INTENT_STATUSES.includes(status as (typeof REFUSED_INTENT_STATUSES)[number])
        ) {
          setLastErrorCode(status)
          return { status: "failed", code: status }
        }
        // `requires_action` reaching here means Stripe could not complete the
        // action in place and did not redirect either, so what happened is not
        // known — and an unknown outcome may not be rolled back.
        setLastErrorCode(status)
        return { status: "unknown", code: status ?? "unknown" }
      } finally {
        setIsSubmitting(false)
      }
    })
  }, [orderId])

  function handleChange(event: StripePaymentElementChangeEvent): void {
    setIsReady(event.complete)
    setCollectionReady(orderId, event.complete)
  }

  const parentProps = { isReady, isSubmitting, lastErrorCode, errors }

  return (
    <>
      <PaymentElement options={options} onChange={handleChange} />
      {children != null ? <Parent {...parentProps}>{children}</Parent> : null}
    </>
  )
}

/**
 * A refusal carrying Stripe's own code, tagged `orders`.
 *
 * `<Errors>` matches on `resource`, and the place-order button writes what it
 * gets from the handoff into the order's error state — so anything else here
 * vanishes from the only outlet consumers mount. That cost a debugging session
 * on the Adyen path.
 */
function gatewayError(message: string | undefined, code: string): BaseError {
  return {
    code: "VALIDATION_ERROR",
    resource: "orders",
    message: message ?? "The payment was not completed.",
    meta: { error: code },
  }
}
