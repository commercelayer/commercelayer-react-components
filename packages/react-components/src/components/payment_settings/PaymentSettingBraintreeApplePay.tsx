import {
  authorizeBraintreePaymentSession,
  authorizeGiftCardSessions,
  BRAINTREE_SETTING_TYPE,
  readBraintreeClientToken,
} from "@commercelayer/core-components"
import type { PaymentSession } from "@commercelayer/sdk"
import type { ApplePay } from "braintree-web/apple-pay"
import type { Client } from "braintree-web/client"
import { type CSSProperties, type JSX, useContext, useEffect, useRef, useState } from "react"
import Parent from "#components/utils/Parent"
import CommerceLayerContext from "#context/CommerceLayerContext"
import OrderContext from "#context/OrderContext"
import PaymentSettingChildrenContext from "#context/PaymentSettingChildrenContext"
import { useCollectionPermitted } from "#hooks/useCollectionPermitted"
import { useStickySessionValue } from "#hooks/useStickySessionValue"
import type { BaseError } from "#typings/errors"
import type { ChildrenFunction } from "#typings/index"
import { applePayError, applePaySessionCtor } from "#utils/applePay"
import { braintreeErrorCode, interopDefault, sessionAmount } from "#utils/braintree"
import { setCollecting, setOutOfBandCollection } from "#utils/paymentGatewayStore"

/**
 * The Apple Pay JS version this is written against: version 3 is the first with
 * `ApplePayError` and the `{ status, errors }` form of `completePayment`, which
 * is what lets a refusal be shown inside the sheet.
 */
const APPLE_PAY_VERSION = 3

export interface PaymentSettingBraintreeApplePayChildrenProps {
  /** A payment is in flight: the sheet is authorized and Braintree is answering. */
  isSubmitting: boolean
  /**
   * The code behind the last failure: `TermsNotAccepted`, Braintree's own
   * (`APPLE_PAY_…`), or the authorization's status (`declined`, `failed`) when
   * Braintree refused the payment. Map it to copy in the checkout's language;
   * the `message` on `errors` is an English fallback.
   */
  lastErrorCode?: string
  errors: BaseError[]
}

interface Props {
  /**
   * Rendered after the button, and only when the button is: an application
   * puts its "or pay by card" divider and its error outlet here, so neither
   * shows on a browser that cannot pay with Apple Pay.
   */
  children?: ChildrenFunction<PaymentSettingBraintreeApplePayChildrenProps>
  /**
   * The store's name, as the sheet shows it — "Pay {displayName}" — and as
   * merchant validation sends it to Apple. Apple asks for the canonical,
   * unlocalized name, 128 characters at most.
   */
  displayName: string
  /** Apple's button type: `plain` (the default), `buy`, `check-out`, … */
  buttonType?: string
  /** Apple's button style: `black` (the default), `white` or `white-outline`. */
  buttonStyle?: "black" | "white" | "white-outline"
  /** Class on the button, for its size and placement. Apple draws the rest. */
  className?: string
  /** The button's accessible name. Apple's artwork carries no text node. */
  label?: string
}

/**
 * Apple Pay through Braintree, for an order on the `payment_sessions` model.
 *
 * Mounted inside `<PaymentSetting>` beside `<PaymentSettingBraintreePayment>`,
 * and **mounting it is the opt-in**. Apple Pay is the one method whose being
 * offered is no evidence it can work: `canMakePayments()` asks only whether the
 * device can pay, and whether *this domain* is registered for Apple Pay on the
 * Braintree merchant is settled at merchant validation — after the shopper has
 * tapped. So it renders only where an application has said its domains are
 * registered, and nothing at all on a browser without Apple Pay.
 *
 * The card fields stay live beside it: `<PlaceOrderButton>` pays by card, this
 * button pays through Apple's sheet. It owns its click, so what the place
 * button does for a card happens here instead, at the moments Apple allows:
 *
 * - the privacy-and-terms gate on the click, **synchronously** — the sheet must
 *   be begun inside the click's gesture, so nothing may be awaited before it;
 * - the gift cards on `onpaymentauthorized`, after the shopper has authorized
 *   in the sheet and before anything reaches Braintree, so a refused payment
 *   never leaves them charged after it — and a gift card that cannot be charged
 *   is reported inside the sheet, which stays open;
 * - the nonce handed to Commerce Layer exactly as the card's is, on the same
 *   Payment Session, and the sheet completed with the authorization's verdict.
 *
 * The order is then placed by `<PlaceOrderButton>` without a click, as an
 * **Out-of-Band Collection**. No 3DS: an Apple Pay payment carries the
 * device's own cryptogram.
 */
export function PaymentSettingBraintreeApplePay(props: Props): JSX.Element | null {
  const { setting, currentPaymentSession, isSelected, readonly } = useContext(
    PaymentSettingChildrenContext
  )
  const isBraintree = setting?.type === BRAINTREE_SETTING_TYPE
  const clientToken = useStickySessionValue(currentPaymentSession, readBraintreeClientToken)

  // Only the selected setting's button is live, for the reason the card form's
  // is: a payment taken through an unselected setting is taken on a session
  // that is not the order's selection.
  const shouldMount = isBraintree && isSelected === true && readonly !== true
  if (!shouldMount || clientToken == null || currentPaymentSession == null) return null

  // Keyed on the token: Braintree is booted from it once, and a session
  // replaced after a refusal brings a new one.
  return (
    <ApplePayButton
      key={clientToken}
      {...props}
      clientToken={clientToken}
      session={currentPaymentSession}
    />
  )
}

function ApplePayButton({
  children,
  displayName,
  buttonType = "plain",
  buttonStyle = "black",
  className,
  label = "Pay with Apple Pay",
  clientToken,
  session,
}: Props & { clientToken: string; session: PaymentSession }): JSX.Element | null {
  const { order, getOrder } = useContext(OrderContext)
  const { accessToken, interceptors } = useContext(CommerceLayerContext)
  const collectionPermitted = useCollectionPermitted()

  const [applePay, setApplePay] = useState<ApplePay | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [errors, setErrors] = useState<BaseError[]>([])
  const [lastErrorCode, setLastErrorCode] = useState<string | undefined>(undefined)

  const orderId = order?.id

  // The current values, for Apple's callbacks, which fire long after the click.
  const latestRef = useRef({
    order,
    getOrder,
    session,
    accessToken,
    interceptors,
    collectionPermitted,
    displayName,
  })
  latestRef.current = {
    order,
    getOrder,
    session,
    accessToken,
    interceptors,
    collectionPermitted,
    displayName,
  }

  const fail = (code: string, message: string): BaseError => {
    const error = gatewayError(message, code)
    setLastErrorCode(code)
    setErrors([error])
    return error
  }

  // Find out whether Apple Pay can be offered at all, and boot Braintree for it.
  // In an effect, not during render: the answer is the browser's, and reading
  // it while rendering would disagree with the server-rendered markup.
  // biome-ignore lint/correctness/useExhaustiveDependencies: booted once per token, through the component's `key`
  useEffect(() => {
    const Session = applePaySessionCtor()
    if (Session == null) return
    try {
      if (!Session.supportsVersion(APPLE_PAY_VERSION) || !Session.canMakePayments()) return
    } catch {
      // Safari throws from `canMakePayments` on an insecure origin. Nothing to
      // offer there, and nothing the shopper could do about it.
      return
    }

    let cancelled = false
    let instance: ApplePay | null = null

    void (async () => {
      try {
        const [clientModule, applePayModule] = (
          await Promise.all([import("braintree-web/client"), import("braintree-web/apple-pay")])
        ).map(interopDefault)
        if (cancelled) return
        const client: Client = await clientModule.create({ authorization: clientToken })
        instance = (await applePayModule.create({ client })) as ApplePay
        if (cancelled) {
          void instance.teardown().catch(() => {})
          return
        }
        setApplePay(instance)
      } catch (error) {
        // Not offered, and not the shopper's problem: most often Apple Pay is
        // simply not enabled on the Braintree merchant (`APPLE_PAY_NOT_ENABLED`).
        // An expired client token is the card form's to renew; this button
        // comes back with the new session.
        if (process.env.NODE_ENV !== "production") {
          console.warn(
            `[commercelayer] <PaymentSettingBraintreeApplePay> not offered: ${
              braintreeErrorCode(error) ?? (error instanceof Error ? error.message : "unknown")
            }.`
          )
        }
      }
    })()

    return () => {
      cancelled = true
      if (instance != null) void instance.teardown().catch(() => {})
    }
  }, [])

  if (applePay == null) return null

  /**
   * The click: the gate, then the sheet. Synchronous to the end.
   *
   * `session.begin()` has to run inside the click's user gesture, and an
   * `await` in front of it is a race Safari settles against us — which is why
   * the gift cards wait for `onpaymentauthorized` instead.
   */
  const handleClick = (): void => {
    const Session = applePaySessionCtor()
    if (Session == null || isSubmitting) return
    const current = latestRef.current

    if (!current.collectionPermitted) {
      // The only place this can be said: the shopper pressed Apple's button,
      // not ours, and a button that does nothing reads as broken.
      fail("TermsNotAccepted", "Accept the terms and conditions to continue.")
      return
    }
    setErrors([])
    setLastErrorCode(undefined)

    const request = applePay.createPaymentRequest({
      // Country, currency, networks and capabilities come from the Braintree
      // merchant account, which is also what the payment is charged in.
      total: { label: current.displayName, amount: sessionAmount(current.session) },
    })

    let sheet: ApplePaySession
    try {
      // Braintree's typings and Apple's disagree only on how narrowly they
      // type the capability strings; the object is the one Apple expects.
      sheet = new Session(APPLE_PAY_VERSION, request as ApplePayJS.ApplePayPaymentRequest)
    } catch (error) {
      fail("ApplePaySessionFailed", error instanceof Error ? error.message : "Apple Pay failed.")
      return
    }

    sheet.onvalidatemerchant = (event) => {
      applePay
        .performValidation({
          validationURL: event.validationURL,
          displayName: latestRef.current.displayName,
        })
        .then((merchantSession: unknown) => {
          sheet.completeMerchantValidation(merchantSession)
        })
        .catch((error: unknown) => {
          // Before any card is chosen, so nothing has moved. On a domain not
          // registered for Apple Pay on the Braintree merchant this is where
          // it ends — the button had no way of knowing before the tap.
          fail(
            braintreeErrorCode(error) ?? "MerchantValidationFailed",
            "Apple Pay is not available right now."
          )
          sheet.abort()
        })
    }

    sheet.onpaymentauthorized = (event) => {
      void onAuthorized(applePay, sheet, Session, event)
    }

    sheet.begin()
  }

  /**
   * The shopper has authorized in the sheet: charge the gift cards, then hand
   * the nonce to Commerce Layer and answer the sheet with the verdict.
   */
  async function onAuthorized(
    instance: ApplePay,
    sheet: ApplePaySession,
    Session: typeof ApplePaySession,
    event: ApplePayJS.ApplePayPaymentAuthorizedEvent
  ): Promise<void> {
    const current = latestRef.current
    /**
     * Answer the sheet. Guarded, because Apple gives `onpaymentauthorized` a
     * time limit and closes the sheet on its own past it — completing a sheet
     * that is gone throws, and the outcome still has to reach the order.
     */
    const complete = (succeeded: boolean, message?: string): void => {
      const error = message != null ? applePayError(message) : undefined
      try {
        sheet.completePayment(
          succeeded
            ? { status: Session.STATUS_SUCCESS }
            : { status: Session.STATUS_FAILURE, errors: error != null ? [error] : [] }
        )
      } catch {
        // The sheet has already closed; what matters is reported below.
      }
    }

    if (current.order == null || current.accessToken == null) {
      complete(false, "The payment could not be started.")
      return
    }

    setIsSubmitting(true)
    try {
      // Gift cards first, as on every other path: a refused payment must never
      // leave them charged after it.
      try {
        const authorized = await authorizeGiftCardSessions({
          accessToken: current.accessToken,
          interceptors: current.interceptors,
          order: current.order,
        })
        if (authorized.errors.length > 0) {
          const message = authorized.errors[0]?.message ?? "A gift card was refused."
          setLastErrorCode("GiftCardRefused")
          setErrors(
            authorized.errors.map((error) => ({
              code: "VALIDATION_ERROR" as const,
              resource: "orders" as const,
              message: error.message,
              field: error.field,
              meta: { error: error.meta?.error ?? "GiftCardRefused" },
            }))
          )
          // Apple keeps the sheet open on a failure, so the shopper can try again.
          complete(false, message)
          return
        }
        // So the place sequence, which runs once this has collected, skips the
        // cards it would otherwise authorize a second time.
        if (authorized.authorizedSessionIds.length > 0) {
          await current.getOrder(current.order.id)
        }
      } catch {
        fail("GiftCardRefused", "The gift cards could not be charged.")
        complete(false, "The gift cards could not be charged.")
        return
      }

      // From here a payment is in flight that nothing on the order records yet:
      // nothing may delete this session, and the place button shows it is busy.
      setCollecting(orderId, true)
      setOutOfBandCollection(orderId, "in-progress")

      let nonce: string
      try {
        nonce = (await instance.tokenize({ token: event.payment.token })).nonce
      } catch (error) {
        // Braintree could not read Apple's token: nothing has been charged,
        // and the session is untouched — the shopper may simply try again.
        fail(
          braintreeErrorCode(error) ?? "TOKENIZATION_FAILED",
          "The payment could not be completed."
        )
        complete(false, "The payment could not be completed.")
        setOutOfBandCollection(orderId, "no")
        return
      }

      const result = await authorizeBraintreePaymentSession({
        accessToken: current.accessToken,
        interceptors: current.interceptors,
        paymentSessionId: current.session.id,
        nonce,
      })

      if (result.status === "authorized") {
        complete(true)
        // Money taken and nobody pressed the place button: it takes the order
        // the rest of the way on its own.
        setOutOfBandCollection(orderId, "done")
        return
      }

      // A refusal burns the session, and an unknown outcome must not be undone:
      // both are the place button's to handle, and it does — the session is
      // discarded where it can be (an authorization in flight blocks it), and
      // the gift cards stay where they are either way.
      const message =
        result.status === "refused"
          ? "The payment was declined."
          : "The payment could not be confirmed."
      const error = fail(result.code, message)
      complete(false, message)
      setOutOfBandCollection(orderId, "failed", [error])
    } catch (error) {
      // Thrown from somewhere nothing above expected, possibly after the nonce
      // reached Commerce Layer: reported, and never rolled back.
      const reported = fail(
        braintreeErrorCode(error) ?? "unknown",
        "The payment could not be confirmed."
      )
      complete(false, "The payment could not be confirmed.")
      setOutOfBandCollection(orderId, "failed", [reported])
    } finally {
      setCollecting(orderId, false)
      setIsSubmitting(false)
    }
  }

  // Apple's own artwork, drawn by Safari from these properties — no script to
  // load and no image to ship. React hyphenates the keys into the
  // `-apple-pay-button-*` properties Safari reads.
  const appleStyle = {
    WebkitAppearance: "-apple-pay-button",
    ApplePayButtonType: buttonType,
    ApplePayButtonStyle: buttonStyle,
  } as CSSProperties

  return (
    <>
      <button
        type="button"
        className={className}
        style={appleStyle}
        aria-label={label}
        lang={typeof document !== "undefined" ? document.documentElement.lang : undefined}
        disabled={isSubmitting}
        onClick={handleClick}
      />
      {children != null ? (
        <Parent {...{ isSubmitting, lastErrorCode, errors }}>{children}</Parent>
      ) : null}
    </>
  )
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

export default PaymentSettingBraintreeApplePay
