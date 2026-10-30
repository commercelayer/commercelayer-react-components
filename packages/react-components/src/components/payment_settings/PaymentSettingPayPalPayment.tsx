import {
  authorizeGiftCardSessions,
  authorizePaymentSession,
  PAYPAL_SETTING_TYPE,
  readPayPalClientId,
  readPayPalOrderId,
} from "@commercelayer/core-components"
import type { PaymentSession } from "@commercelayer/sdk"
import type { OneTimePaymentSession } from "@paypal/paypal-js/sdk-v6"
import { createElement, type JSX, useContext, useEffect, useRef, useState } from "react"
import Parent from "#components/utils/Parent"
import CommerceLayerContext from "#context/CommerceLayerContext"
import OrderContext from "#context/OrderContext"
import PaymentSettingChildrenContext from "#context/PaymentSettingChildrenContext"
import { useCollectionPermitted } from "#hooks/useCollectionPermitted"
import { usePaymentSettingLoader } from "#hooks/usePaymentSettingLoader"
import { useStickySessionValue } from "#hooks/useStickySessionValue"
import type { BaseError } from "#typings/errors"
import type { ChildrenFunction, LoaderType } from "#typings/index"
import {
  registerGatewayCollection,
  setCollecting,
  setOutOfBandCollection,
} from "#utils/paymentGatewayStore"
import { environmentOf, loadPayPal } from "#utils/paypal"

/** Labels PayPal's button can carry, as PayPal names them. */
export type PaymentSettingPayPalButtonType = "pay" | "checkout" | "buynow" | "donate" | "subscribe"

export interface PaymentSettingPayPalPaymentChildrenProps {
  /** Whether PayPal's SDK has loaded and the button is on screen. */
  isLoaded: boolean
  /**
   * PayPal cannot be offered for this order: its SDK did not load, or PayPal
   * says this buyer, currency or merchant is not eligible. The setting has no
   * other way to pay, so this is the application's cue to say so.
   */
  isUnavailable: boolean
  /** A payment is in flight: PayPal approved and Commerce Layer is answering. */
  isSubmitting: boolean
  /**
   * The code behind the last failure: `TermsNotAccepted`, `GiftCardRefused`,
   * PayPal's own, or the authorization's status (`declined`, `failed`) when the
   * payment was refused. Map it to copy in the checkout's language; the
   * `message` on `errors` is an English fallback.
   */
  lastErrorCode?: string
  errors: BaseError[]
}

interface Props {
  /** Rendered after the button: where an application puts its error outlet. */
  children?: ChildrenFunction<PaymentSettingPayPalPaymentChildrenProps>
  /** The label on PayPal's button. Defaults to `pay`. */
  type?: PaymentSettingPayPalButtonType
  /** Class on the element wrapping PayPal's button. */
  className?: string
  /**
   * Shown until PayPal's button is on screen, in place of `<PaymentSetting>`'s
   * `loader` for this setting.
   */
  loader?: LoaderType
}

/**
 * PayPal as a payment setting of its own — PayPal's Orders API through
 * Commerce Layer — for an order on the `payment_sessions` model.
 *
 * Mounted inside `<PaymentSetting>`, which renders it once per available
 * setting; this returns `null` for every setting that is not PayPal's, so a
 * checkout mounts it once and does not branch.
 *
 * Commerce Layer creates the PayPal order with the Payment Session, for the
 * session's amount, and the session's `token` is its id. What happens in the
 * browser is PayPal's v6 button opening PayPal's window on that order — and,
 * once the shopper approves there, the Payment Authorization that takes the
 * money.
 *
 * PayPal is a **Gateway-Owned Button**: its window opens only from a click on
 * PayPal's own button, so `<PlaceOrderButton>` cannot start it, and disables
 * itself with that as the reason. What the place button does for a card
 * happens inside PayPal's click instead — the privacy-and-terms gate, the gift
 * cards — and the order is placed without a click of ours once the payment is
 * authorized, as an **Out-of-Band Collection**.
 */
export function PaymentSettingPayPalPayment(props: Props): JSX.Element | null {
  const { children } = props
  const { setting, currentPaymentSession, isSelected, isPending, readonly } = useContext(
    PaymentSettingChildrenContext
  )
  const loader = usePaymentSettingLoader(props.loader)
  const isPayPal = setting?.type === PAYPAL_SETTING_TYPE
  const clientId = readPayPalClientId(setting)
  // Remembered across a refetch whose `fields` leave `token` out, so the button
  // does not vanish under the shopper.
  const paypalOrderId = useStickySessionValue(currentPaymentSession, readPayPalOrderId)

  // Only the selected setting's button is live: a payment taken through an
  // unselected setting would be taken on a session that is not the selection.
  const shouldMount = isPayPal && isSelected === true && readonly !== true

  if (!isPayPal) return null
  if (!shouldMount || clientId == null || paypalOrderId == null || currentPaymentSession == null) {
    // The Payment Session — and with it the PayPal order — is being created
    // for this setting: the first half of the wait.
    const placeholder = isPending === true && readonly !== true ? loader : null
    return (
      <>
        {placeholder}
        {children != null ? (
          <Parent
            {...{
              isLoaded: false,
              isUnavailable: false,
              isSubmitting: false,
              errors: [],
            }}
          >
            {children}
          </Parent>
        ) : null}
      </>
    )
  }

  return (
    // Keyed on the client id: PayPal's SDK instance is created for one. A new
    // session — a new PayPal order — needs no new instance, since the order is
    // handed over on each click.
    <PayPalButton
      key={clientId}
      {...props}
      loader={loader}
      clientId={clientId}
      paypalOrderId={paypalOrderId}
      session={currentPaymentSession}
    />
  )
}

function PayPalButton({
  children,
  type = "pay",
  className,
  clientId,
  paypalOrderId,
  session,
  loader,
}: Omit<Props, "loader"> & {
  loader: JSX.Element | null
  clientId: string
  paypalOrderId: string
  session: PaymentSession
}): JSX.Element {
  const { order, getOrder } = useContext(OrderContext)
  const { accessToken, interceptors } = useContext(CommerceLayerContext)
  const collectionPermitted = useCollectionPermitted()

  const [isLoaded, setIsLoaded] = useState(false)
  const [isUnavailable, setIsUnavailable] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [errors, setErrors] = useState<BaseError[]>([])
  const [lastErrorCode, setLastErrorCode] = useState<string | undefined>(undefined)
  const checkoutRef = useRef<OneTimePaymentSession | null>(null)
  // Set when the start promise was rejected on purpose, so the error PayPal
  // reports for it does not overwrite the reason already shown.
  const startRefusedRef = useRef(false)

  const orderId = order?.id

  // The current values, for PayPal's callbacks, which fire long after render.
  const latestRef = useRef({
    order,
    getOrder,
    session,
    paypalOrderId,
    accessToken,
    interceptors,
    collectionPermitted,
  })
  latestRef.current = {
    order,
    getOrder,
    session,
    paypalOrderId,
    accessToken,
    interceptors,
    collectionPermitted,
  }

  const fail = (code: string, message: string): BaseError => {
    const error = gatewayError(message, code)
    setLastErrorCode(code)
    setErrors([error])
    return error
  }

  // The place button cannot pay for PayPal, and says so: registered for as
  // long as PayPal is the selection, loading or not.
  useEffect(() => registerGatewayCollection(orderId), [orderId])

  // Load PayPal, check it can be offered, and prepare the payment session the
  // button starts. Once per client id, through the component's `key`.
  // biome-ignore lint/correctness/useExhaustiveDependencies: booted once per client id; callbacks read `latestRef`
  useEffect(() => {
    let cancelled = false
    let checkout: OneTimePaymentSession | null = null

    void (async () => {
      try {
        const paypal = await loadPayPal(environmentOf(latestRef.current.accessToken))
        if (paypal == null) throw new Error("PayPal's SDK did not load.")
        const sdk = await paypal.createInstance({
          clientId,
          components: ["paypal-payments"],
          pageType: "checkout",
        })
        const eligibility = await sdk.findEligibleMethods({
          currencyCode: latestRef.current.session.currency_code ?? undefined,
        })
        if (cancelled) return
        if (!eligibility.isEligible("paypal")) {
          throw new Error("PayPal is not eligible for this buyer or currency.")
        }
        checkout = sdk.createPayPalOneTimePaymentSession({
          onApprove: async () => {
            await onApprove()
          },
          onCancel: () => {
            // Closed before approving: nothing reached PayPal's order. The gift
            // cards charged on the click stay charged and applied, as after any
            // interrupted payment — they count toward the next attempt.
            setCollecting(latestRef.current.order?.id, false)
            setIsSubmitting(false)
          },
          onError: (error) => {
            setCollecting(latestRef.current.order?.id, false)
            setIsSubmitting(false)
            if (startRefusedRef.current) {
              startRefusedRef.current = false
              return
            }
            fail(paypalErrorCode(error), "PayPal could not complete the payment.")
          },
        })
        checkoutRef.current = checkout
        setIsLoaded(true)
      } catch (error) {
        if (cancelled) return
        setIsUnavailable(true)
        // Not the shopper's problem, but the merchant's to know about: most
        // often the REST app is not enabled for this currency.
        if (process.env.NODE_ENV !== "production") {
          console.warn(
            `[commercelayer] <PaymentSettingPayPalPayment> not offered: ${
              error instanceof Error ? error.message : "unknown"
            }`
          )
        }
      }
    })()

    return () => {
      cancelled = true
      checkoutRef.current = null
      checkout?.destroy()
    }
  }, [])

  /**
   * PayPal's click.
   *
   * Everything up to `start` runs synchronously: a browser lets a page open a
   * window only from a user gesture, and an `await` before `start` would spend
   * it. So the terms gate, which needs no round trip, is checked first, and the
   * gift cards — which do — run inside the promise `start` waits on for the
   * PayPal order: PayPal's window opens at once and shows its own loading state
   * until they are charged. Rejecting that promise closes the window before the
   * shopper has done anything in it.
   */
  function onClick(): void {
    const checkout = checkoutRef.current
    if (checkout == null || isSubmitting) return
    const { collectionPermitted, order, accessToken, interceptors, getOrder } = latestRef.current
    if (!collectionPermitted) {
      fail("TermsNotAccepted", "Accept the terms and conditions to continue.")
      return
    }
    if (order == null || accessToken == null) {
      fail("NotReady", "The payment could not be started.")
      return
    }
    setErrors([])
    setLastErrorCode(undefined)
    startRefusedRef.current = false
    // PayPal's window opens now, and the payment method is locked until it
    // closes: switching would unmount this button under a window the shopper
    // can still approve. Every way out releases it — approval, cancel, error,
    // and the start refused below.
    setCollecting(orderId, true)

    const paypalOrder = (async (): Promise<{ orderId: string }> => {
      let refusal: BaseError[] | null = null
      try {
        const authorized = await authorizeGiftCardSessions({ accessToken, interceptors, order })
        if (authorized.errors.length > 0) {
          refusal = authorized.errors.map((error) => ({
            code: "VALIDATION_ERROR" as const,
            resource: "orders" as const,
            message: error.message,
            field: error.field,
            meta: { error: error.meta?.error ?? "GiftCardRefused" },
          }))
        } else if (authorized.authorizedSessionIds.length > 0) {
          // So the place sequence, which runs once this has collected, skips
          // the cards it would otherwise authorize a second time.
          await getOrder(order.id)
        }
      } catch {
        refusal = [gatewayError("The gift cards could not be charged.", "GiftCardRefused")]
      }
      if (refusal != null) {
        setLastErrorCode("GiftCardRefused")
        setErrors(refusal)
        startRefusedRef.current = true
        throw new Error("GiftCardRefused")
      }
      return { orderId: latestRef.current.paypalOrderId }
    })()

    checkout.start({ presentationMode: "auto" }, paypalOrder).catch((error: unknown) => {
      setCollecting(orderId, false)
      setIsSubmitting(false)
      if (startRefusedRef.current) return
      fail(paypalErrorCode(error), "PayPal could not be opened.")
    })
  }

  /** PayPal approved: take the money through Commerce Layer, then report it. */
  async function onApprove(): Promise<void> {
    const current = latestRef.current
    if (current.accessToken == null) {
      // The click locked the payment method; nothing past here would release it.
      setCollecting(orderId, false)
      return
    }

    setIsSubmitting(true)
    // From here a payment is in flight that nothing on the order records yet:
    // nothing may delete this session, and the place button shows it is busy.
    setCollecting(orderId, true)
    setOutOfBandCollection(orderId, "in-progress")
    try {
      // Approval writes nothing to the session — PayPal records it on its own
      // order — so the authorization is the first Commerce Layer hears of it.
      const result = await authorizePaymentSession({
        accessToken: current.accessToken,
        interceptors: current.interceptors,
        paymentSessionId: current.session.id,
      })

      if (result.status === "authorized") {
        // Money taken and nobody pressed the place button: it takes the order
        // the rest of the way on its own.
        setOutOfBandCollection(orderId, "done")
        return
      }
      // An approved PayPal order is authorized once: after a refusal the
      // session is burnt, and the place button clears it so the shopper picks
      // PayPal again, on a new session and a new PayPal order. An unknown
      // outcome must not be undone. Both are the place button's to handle.
      const error = fail(
        result.code,
        result.status === "refused"
          ? "The payment was declined."
          : "The payment could not be confirmed."
      )
      setOutOfBandCollection(orderId, "failed", [error])
    } catch (error) {
      // Thrown from somewhere nothing above expected, possibly after the
      // authorization was created: reported, and never rolled back.
      const reported = fail(paypalErrorCode(error), "The payment could not be confirmed.")
      setOutOfBandCollection(orderId, "failed", [reported])
    } finally {
      setCollecting(orderId, false)
      setIsSubmitting(false)
    }
  }

  const parentProps = { isLoaded, isUnavailable, isSubmitting, lastErrorCode, errors }

  return (
    <>
      {/* Until the button is up, and not once PayPal turns out to be
          unavailable: no button is coming then. */}
      {!isLoaded && !isUnavailable ? loader : null}
      {isLoaded ? (
        <div className={className}>
          {/* A custom element PayPal's SDK registers once its script has loaded. */}
          {createElement("paypal-button", {
            type,
            disabled: isSubmitting || undefined,
            onClick,
          })}
        </div>
      ) : null}
      {children != null ? <Parent {...parentProps}>{children}</Parent> : null}
    </>
  )
}

/** PayPal's own code for a failure, when it gives one. */
function paypalErrorCode(error: unknown): string {
  if (error != null && typeof error === "object") {
    const code = (error as { code?: unknown }).code
    if (typeof code === "string" && code !== "") return code
  }
  return "PAYPAL_ERROR"
}

/**
 * An error tagged `orders`, so that when it is handed to `<PlaceOrderButton>`
 * as an out-of-band failure it lands in the outlet consumers mount next to it.
 */
function gatewayError(message: string, code: string): BaseError {
  return {
    code: "VALIDATION_ERROR",
    resource: "orders",
    message,
    meta: { error: code },
  }
}

export default PaymentSettingPayPalPayment
