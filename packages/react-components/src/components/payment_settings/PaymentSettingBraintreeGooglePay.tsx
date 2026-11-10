import {
  authorizeBraintreePaymentSession,
  BRAINTREE_SETTING_TYPE,
  readBraintreeClientToken,
} from "@commercelayer/core-components"
import type { PaymentSession } from "@commercelayer/sdk"
import type { Client } from "braintree-web/client"
import type {
  GooglePayment as GooglePaymentTyped,
  GooglePaymentTokenizePayload,
} from "braintree-web/google-payment"
import type { ThreeDSecure } from "braintree-web/three-d-secure"
import { type JSX, useContext, useEffect, useRef, useState } from "react"
import Parent from "#components/utils/Parent"
import CommerceLayerContext from "#context/CommerceLayerContext"
import OrderContext from "#context/OrderContext"
import PaymentSettingChildrenContext from "#context/PaymentSettingChildrenContext"
import { useCollectionPermitted } from "#hooks/useCollectionPermitted"
import { useStickySessionValue } from "#hooks/useStickySessionValue"
import type { BaseError } from "#typings/errors"
import type { ChildrenFunction } from "#typings/index"
import {
  braintreeErrorCode,
  collectPageDeviceData,
  interopDefault,
  liabilityRefusal,
  pageDeviceData,
  pageThreeDSecureInstance,
  sessionAmount,
  verifyCard,
} from "#utils/braintree"
import { loadGooglePaymentsApi } from "#utils/googlePay"
import { isCollecting, setCollecting, setOutOfBandCollection } from "#utils/paymentGatewayStore"
import { authorizeWalletGiftCards, type GiftCardReconciliation } from "#utils/walletGiftCards"

type PaymentData = google.payments.api.PaymentData
type PaymentDataRequest = google.payments.api.PaymentDataRequest

/**
 * Braintree's Google Pay instance as it is at runtime: the typings leave out
 * `teardown`, and type `createPaymentDataRequest`'s overrides more narrowly
 * than Braintree reads them — it takes any part of Google's request.
 */
type GooglePayment = Omit<GooglePaymentTyped, "createPaymentDataRequest"> & {
  createPaymentDataRequest(
    overrides?: Omit<Partial<PaymentDataRequest>, "merchantInfo" | "allowedPaymentMethods"> & {
      // Each filled in from Braintree's defaults, so both may be partial.
      merchantInfo?: { merchantId?: string; merchantName?: string }
      allowedPaymentMethods?: Array<{ type: google.payments.api.PaymentMethodType }>
    }
  ): PaymentDataRequest & {
    environment?: google.payments.api.Environment
  }
  teardown(): Promise<void>
}
type PaymentAuthorizationResult = google.payments.api.PaymentAuthorizationResult

export interface PaymentSettingBraintreeGooglePayChildrenProps {
  /** A payment is in flight: Google's sheet has closed and Braintree is answering. */
  isSubmitting: boolean
  /**
   * The code behind the last failure: `TermsNotAccepted`, `GiftCardRefused`,
   * Google's status code, Braintree's own (`GOOGLE_PAYMENT_…`, `THREEDS_…`),
   * the 3DS status when the shopper did not authenticate, or the
   * authorization's status (`declined`, `failed`) when Braintree refused the
   * payment. Map it to copy in the checkout's language; the `message` on
   * `errors` is an English fallback.
   */
  lastErrorCode?: string
  errors: BaseError[]
}

interface Props {
  /**
   * Rendered after the button, and only when the button is: an application
   * puts its "or pay by card" divider and its error outlet here, so neither
   * shows on a browser that cannot pay with Google Pay.
   */
  children?: ChildrenFunction<PaymentSettingBraintreeGooglePayChildrenProps>
  /**
   * The merchant ID Google issues once it has approved the integration.
   * Required when the Braintree merchant is a production one, where nothing
   * renders without it; a sandbox merchant pays in Google's `TEST`
   * environment, which needs none.
   */
  googleMerchantId?: string
  /** The store's name, as Google's sheet shows it. */
  merchantName?: string
  /** Google's button type: `buy` (the default), `plain`, `pay`, `checkout`, … */
  buttonType?: google.payments.api.ButtonType
  /** Google's button color: `default` (the default), `black` or `white`. */
  buttonColor?: google.payments.api.ButtonColor
  /**
   * Class on the element Google's button is mounted into, for its size and
   * placement. The button fills it; Google draws the rest.
   */
  className?: string
  /**
   * Run 3D Secure on a card Google holds as a plain card number. Defaults to
   * `true`, as on `<PaymentSettingBraintreePayment>`.
   *
   * A card on a phone pays with a network token and the device's cryptogram,
   * which needs no 3DS; a card saved to the shopper's Google account pays
   * with the card number itself, which is exactly a card typed in. Turn it off
   * only for a merchant account that does not have 3DS enabled.
   */
  threeDSecure?: boolean
  /**
   * Refuse a card for which 3DS could not shift the liability at all.
   * Defaults to `false`; see `<PaymentSettingBraintreePayment>`.
   */
  requireLiabilityShift?: boolean
}

/**
 * Google Pay through Braintree, for an order on the `payment_sessions` model.
 *
 * Mounted inside `<PaymentSetting>` beside `<PaymentSettingBraintreePayment>`,
 * like `<PaymentSettingBraintreeApplePay>`: the card fields stay live, and
 * this button pays through Google's sheet. It renders only when Google Pay is
 * enabled on the Braintree merchant and Google says the browser can pay, and
 * nothing at all otherwise.
 *
 * It owns its click, so what the place button does for a card happens here
 * instead, at the moments Google allows:
 *
 * - the privacy-and-terms gate on the click, **synchronously** — Google opens
 *   its sheet only inside the click's gesture, so nothing may be awaited before
 *   `loadPaymentData()`;
 * - the gift cards on `onPaymentAuthorized`, after the shopper has chosen a
 *   card and before anything reaches Braintree, so a refused payment never
 *   leaves them charged after it — and a gift card that cannot be charged is
 *   reported inside Google's sheet, which stays open;
 * - once the sheet has closed, the nonce, 3D Secure for a card Google holds as
 *   a plain card number, and the nonce handed to Commerce Layer on the same
 *   Payment Session as the card's.
 *
 * The order is then placed by `<PlaceOrderButton>` without a click, as an
 * **Out-of-Band Collection**.
 */
export function PaymentSettingBraintreeGooglePay(props: Props): JSX.Element | null {
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
    <GooglePayButton
      key={clientToken}
      {...props}
      clientToken={clientToken}
      session={currentPaymentSession}
    />
  )
}

interface GooglePayInstances {
  client: Client
  googlePayment: GooglePayment
  paymentsClient: google.payments.api.PaymentsClient
}

function GooglePayButton({
  children,
  googleMerchantId,
  merchantName,
  buttonType = "buy",
  buttonColor = "default",
  className,
  threeDSecure: withThreeDSecure = true,
  requireLiabilityShift = false,
  clientToken,
  session,
}: Props & { clientToken: string; session: PaymentSession }): JSX.Element | null {
  const { order, getOrder } = useContext(OrderContext)
  const { accessToken, interceptors } = useContext(CommerceLayerContext)
  const collectionPermitted = useCollectionPermitted()

  const [instances, setInstances] = useState<GooglePayInstances | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [errors, setErrors] = useState<BaseError[]>([])
  const [lastErrorCode, setLastErrorCode] = useState<string | undefined>(undefined)
  const containerRef = useRef<HTMLDivElement | null>(null)

  const orderId = order?.id

  // The current values, for Google's callbacks, which fire long after the click.
  const latestRef = useRef({
    order,
    getOrder,
    session,
    accessToken,
    interceptors,
    collectionPermitted,
    isSubmitting,
    requireLiabilityShift,
  })
  latestRef.current = {
    order,
    getOrder,
    session,
    accessToken,
    interceptors,
    collectionPermitted,
    isSubmitting,
    requireLiabilityShift,
  }

  const fail = (code: string, message: string): BaseError => {
    const error = gatewayError(message, code)
    setLastErrorCode(code)
    setErrors([error])
    return error
  }

  /**
   * Whether the order held here may be missing gift cards an earlier attempt
   * charged. Kept across attempts in the same sheet; see `authorizeWalletGiftCards`.
   */
  const reconciliationRef = useRef<GiftCardReconciliation>({ pending: false })

  /**
   * The gift cards, while Google's sheet is still open. Registered once with
   * the payments client, so it reads everything from the ref.
   */
  const onPaymentAuthorizedRef = useRef<() => Promise<PaymentAuthorizationResult>>(async () => ({
    transactionState: "SUCCESS",
  }))
  onPaymentAuthorizedRef.current = async (): Promise<PaymentAuthorizationResult> => {
    const current = latestRef.current
    if (current.order == null || current.accessToken == null) {
      return sheetError("The payment could not be started.")
    }
    const charged = await authorizeWalletGiftCards({
      accessToken: current.accessToken,
      interceptors: current.interceptors,
      order: current.order,
      getOrder: current.getOrder,
      reconciliation: reconciliationRef.current,
    })
    if (charged.status === "refused") {
      setLastErrorCode("GiftCardRefused")
      setErrors(charged.errors)
      // Google keeps the sheet open on an error, so the shopper can try again.
      return sheetError(charged.message)
    }
    if (charged.status === "failed") {
      fail(charged.code, charged.message)
      return sheetError(charged.message)
    }
    // A refusal shown on an earlier try in the same sheet no longer applies.
    setErrors([])
    setLastErrorCode(undefined)
    return { transactionState: "SUCCESS" }
  }

  /**
   * Whether this button's sheet is open and holding the payment lock. Tracked
   * apart from the authorization that follows, which takes the lock over, so
   * an unmount releases exactly what it owns.
   */
  const sheetOpenRef = useRef(false)
  const releaseSheet = (): void => {
    if (!sheetOpenRef.current) return
    sheetOpenRef.current = false
    setCollecting(latestRef.current.order?.id, false)
  }

  // A sheet still open when the button goes away must not leave the payment
  // method locked for the rest of the page.
  // biome-ignore lint/correctness/useExhaustiveDependencies: releases on unmount only
  useEffect(() => releaseSheet, [])

  // Find out whether Google Pay can be offered at all, and boot Braintree for
  // it. In an effect, not during render: the answer is the browser's.
  // biome-ignore lint/correctness/useExhaustiveDependencies: booted once per token, through the component's `key`
  useEffect(() => {
    let cancelled = false
    let booted: GooglePayment | null = null

    void (async () => {
      try {
        const [api, clientModule, googlePaymentModule] = await Promise.all([
          loadGooglePaymentsApi(),
          import("braintree-web/client").then(interopDefault),
          import("braintree-web/google-payment").then(interopDefault),
        ])
        if (cancelled) return
        const client: Client = await clientModule.create({ authorization: clientToken })
        booted = (await googlePaymentModule.create({
          client,
          googlePayVersion: 2,
          googleMerchantId,
        })) as GooglePayment
        if (cancelled) {
          void booted.teardown().catch(() => {})
          return
        }

        // Braintree's request carries Google's environment, from the
        // merchant's: `TEST` for a sandbox merchant, `PRODUCTION` otherwise.
        const request = paymentDataRequest(booted, {
          googleMerchantId,
          merchantName,
          session,
          order,
        })
        if (request.environment === "PRODUCTION" && googleMerchantId == null) {
          throw notOffered("GOOGLE_MERCHANT_ID_MISSING")
        }

        const paymentsClient = new api.PaymentsClient({
          environment: request.environment,
          paymentDataCallbacks: {
            onPaymentAuthorized: () => onPaymentAuthorizedRef.current(),
          },
        })
        const { result } = await paymentsClient.isReadyToPay({
          apiVersion: request.apiVersion,
          apiVersionMinor: request.apiVersionMinor,
          allowedPaymentMethods: request.allowedPaymentMethods,
        })
        if (cancelled) return
        if (!result) throw notOffered("GOOGLE_PAY_NOT_READY")
        setInstances({ client, googlePayment: booted, paymentsClient })
        collectPageDeviceData(client)
      } catch (error) {
        // Not offered, and not the shopper's problem: most often Google Pay is
        // simply not enabled on the Braintree merchant
        // (`GOOGLE_PAYMENT_NOT_ENABLED`), or the browser has no Google Pay.
        if (process.env.NODE_ENV !== "production") {
          console.warn(
            `[commercelayer] <PaymentSettingBraintreeGooglePay> not offered: ${
              braintreeErrorCode(error) ?? (error instanceof Error ? error.message : "unknown")
            }.`
          )
        }
      }
    })()

    return () => {
      cancelled = true
      if (booted != null) void booted.teardown().catch(() => {})
    }
  }, [])

  /**
   * The click: the gate, then the sheet. Synchronous up to `loadPaymentData()`,
   * which Google honours only inside the click's gesture.
   */
  const handleClickRef = useRef<() => void>(() => {})
  handleClickRef.current = (): void => {
    const current = latestRef.current
    // Another route is already paying on this session — the card form, or this
    // button's own sheet — and a second one would race it to the same Payment
    // Session. The place button shows that payment as busy.
    if (instances == null || current.isSubmitting || isCollecting(current.order?.id)) return

    if (!current.collectionPermitted) {
      // The only place this can be said: the shopper pressed Google's button,
      // not ours, and Google's button has no disabled state to show instead.
      fail("TermsNotAccepted", "Accept the terms and conditions to continue.")
      return
    }
    setErrors([])
    setLastErrorCode(undefined)

    // The sheet opens now, and the payment is reserved until it closes and
    // whatever follows it is over: the card route and the payment-method switch
    // stay locked meanwhile, gift cards included. Every way out releases it.
    sheetOpenRef.current = true
    setCollecting(current.order?.id, true)
    // A new sheet starts from the order the context holds by now.
    reconciliationRef.current.order = undefined

    const request = paymentDataRequest(instances.googlePayment, {
      googleMerchantId,
      merchantName,
      session: current.session,
      order: current.order,
    })
    instances.paymentsClient.loadPaymentData(request).then(
      (paymentData) => {
        void onPaymentData(instances, paymentData)
      },
      (error: unknown) => {
        releaseSheet()
        // The shopper closing the sheet is not a failure.
        const code = (error as { statusCode?: string } | null)?.statusCode
        if (code === "CANCELED") return
        fail(code ?? "GOOGLE_PAY_FAILED", "Google Pay is not available right now.")
      }
    )
  }

  // Google's button, mounted into our container once Google Pay is offered.
  // biome-ignore lint/correctness/useExhaustiveDependencies: the button reads the click through a ref
  useEffect(() => {
    const container = containerRef.current
    if (instances == null || container == null) return
    const button = instances.paymentsClient.createButton({
      onClick: () => handleClickRef.current(),
      buttonType,
      buttonColor,
      buttonSizeMode: "fill",
    })
    container.appendChild(button)
    return () => {
      button.remove()
    }
  }, [instances])

  /**
   * Google's sheet has closed with a card, the gift cards already charged:
   * the nonce, 3DS where it applies, and the nonce handed to Commerce Layer.
   */
  async function onPaymentData(
    { client, googlePayment }: GooglePayInstances,
    paymentData: PaymentData
  ): Promise<void> {
    const current = latestRef.current
    // The sheet's hold ends here; the authorization takes the lock over
    // without letting go of it in between.
    sheetOpenRef.current = false
    if (current.accessToken == null) {
      setCollecting(orderId, false)
      return
    }

    setIsSubmitting(true)
    // From here a payment is in flight that nothing on the order records yet:
    // nothing may delete this session, and the place button shows it is busy.
    setCollecting(orderId, true)
    setOutOfBandCollection(orderId, "in-progress")
    try {
      let card: GooglePaymentTokenizePayload
      try {
        card = await googlePayment.parseResponse(paymentData)
      } catch (error) {
        // Braintree could not read Google's token: nothing has been charged,
        // and the session is untouched — the shopper may simply try again.
        fail(
          braintreeErrorCode(error) ?? "TOKENIZATION_FAILED",
          "The payment could not be completed."
        )
        setOutOfBandCollection(orderId, "no")
        return
      }

      let nonce = card.nonce
      if (withThreeDSecure && !card.details.isNetworkTokenized) {
        try {
          const threeDSecureModule = interopDefault(await import("braintree-web/three-d-secure"))
          // The page's instance, shared with the card form: Cardinal sets up
          // once per page. See `pageThreeDSecureInstance`.
          const threeDSecure = await pageThreeDSecureInstance(
            () => threeDSecureModule.create({ client, version: 2 }) as Promise<ThreeDSecure>
          )
          const verified = await verifyCard(threeDSecure, {
            nonce: card.nonce,
            bin: card.details.bin,
            session: current.session,
            order: current.order,
          })
          const refusal = liabilityRefusal(verified, latestRef.current.requireLiabilityShift)
          if (refusal != null) {
            // Nothing reached Commerce Layer: the session is intact, and the
            // shopper may pay with another card.
            fail(refusal, "The card could not be authenticated.")
            setOutOfBandCollection(orderId, "no")
            return
          }
          nonce = verified.nonce
        } catch (error) {
          fail(
            braintreeErrorCode(error) ?? "THREEDS_FAILED",
            "The card could not be authenticated."
          )
          setOutOfBandCollection(orderId, "no")
          return
        }
      }

      const result = await authorizeBraintreePaymentSession({
        accessToken: current.accessToken,
        interceptors: current.interceptors,
        paymentSessionId: current.session.id,
        nonce,
        deviceData: await pageDeviceData(),
      })

      if (result.status === "authorized") {
        // Money taken and nobody pressed the place button: it takes the order
        // the rest of the way on its own.
        setOutOfBandCollection(orderId, "done")
        return
      }

      // A refusal burns the session, and an unknown outcome must not be undone:
      // both are the place button's to handle, as for Apple Pay.
      const error = fail(
        result.code,
        result.status === "refused"
          ? "The payment was declined."
          : "The payment could not be confirmed."
      )
      setOutOfBandCollection(orderId, "failed", [error])
    } catch (error) {
      // Thrown from somewhere nothing above expected, possibly after the nonce
      // reached Commerce Layer: reported, and never rolled back.
      const reported = fail(
        braintreeErrorCode(error) ?? "unknown",
        "The payment could not be confirmed."
      )
      setOutOfBandCollection(orderId, "failed", [reported])
    } finally {
      setCollecting(orderId, false)
      setIsSubmitting(false)
    }
  }

  if (instances == null) return null

  return (
    <>
      <div ref={containerRef} className={className} />
      {children != null ? (
        <Parent {...{ isSubmitting, lastErrorCode, errors }}>{children}</Parent>
      ) : null}
    </>
  )
}

/**
 * Braintree's payment data request for this session: cards only, the
 * session's amount, and the gift cards charged on `onPaymentAuthorized`.
 *
 * Cards only, although Braintree adds PayPal to Google's sheet when the
 * merchant links it: PayPal has a button of its own beside this one, and a
 * second way into it is a second flow to support for no gain.
 */
function paymentDataRequest(
  googlePayment: GooglePayment,
  {
    googleMerchantId,
    merchantName,
    session,
    order,
  }: {
    googleMerchantId?: string
    merchantName?: string
    session: PaymentSession
    order?: { currency_code?: string | null } | null
  }
): ReturnType<GooglePayment["createPaymentDataRequest"]> {
  return googlePayment.createPaymentDataRequest({
    // Replaces Braintree's, which carries the merchant ID alone.
    merchantInfo: { merchantId: googleMerchantId, merchantName },
    // A fresh object every time: Braintree fills it in place from its defaults.
    allowedPaymentMethods: [{ type: "CARD" }],
    // The session's amount — the remainder after any gift card — not the order total.
    transactionInfo: {
      currencyCode: order?.currency_code ?? "",
      totalPriceStatus: "FINAL",
      totalPrice: sessionAmount(session),
    },
    callbackIntents: ["PAYMENT_AUTHORIZATION"],
  })
}

/** Why Google Pay is not offered, in the shape Braintree's own errors have. */
function notOffered(code: string): Error {
  return Object.assign(new Error(code), { code })
}

/** An answer that keeps Google's sheet open, showing our message. */
function sheetError(message: string): PaymentAuthorizationResult {
  return {
    transactionState: "ERROR",
    error: { intent: "PAYMENT_AUTHORIZATION", message, reason: "PAYMENT_DATA_INVALID" },
  }
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

export default PaymentSettingBraintreeGooglePay
