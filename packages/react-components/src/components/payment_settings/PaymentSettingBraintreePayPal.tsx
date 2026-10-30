import {
  authorizeBraintreePaymentSession,
  authorizeGiftCardSessions,
  BRAINTREE_SETTING_TYPE,
  readBraintreeClientToken,
} from "@commercelayer/core-components"
import type { PaymentSession } from "@commercelayer/sdk"
import type { Client } from "braintree-web/client"
import type { PayPalCheckout } from "braintree-web/paypal-checkout"
import { type JSX, useContext, useEffect, useRef, useState } from "react"
import Parent from "#components/utils/Parent"
import CommerceLayerContext from "#context/CommerceLayerContext"
import OrderContext from "#context/OrderContext"
import PaymentSettingChildrenContext from "#context/PaymentSettingChildrenContext"
import { useCollectionPermitted } from "#hooks/useCollectionPermitted"
import { useStickySessionValue } from "#hooks/useStickySessionValue"
import type { BaseError } from "#typings/errors"
import type { ChildrenFunction } from "#typings/index"
import { braintreeErrorCode, interopDefault, sessionAmount } from "#utils/braintree"
import { setCollecting, setOutOfBandCollection } from "#utils/paymentGatewayStore"

/**
 * The global PayPal's SDK is loaded under.
 *
 * Not `paypal`, its default: the Adyen Drop-in loads the same SDK for its own
 * PayPal, with Adyen's client id, and two scripts writing one global leave
 * whichever loaded last driving both. `braintree-web` passes `dataAttributes`
 * through to the script as `data-*`, and never reads the global itself, so
 * PayPal's `data-namespace` keeps the two apart.
 */
const PAYPAL_NAMESPACE = "commercelayerBraintreePayPal"

/** The slice of PayPal's JS SDK this component drives. */
interface PayPalButtonsActions {
  resolve: () => Promise<void>
  reject: () => Promise<void>
}

interface PayPalButtonsInstance {
  isEligible: () => boolean
  render: (container: HTMLElement) => Promise<void>
  close: () => Promise<void>
}

interface PayPalSdk {
  FUNDING: { PAYPAL: string }
  Buttons: (options: {
    fundingSource: string
    style?: PaymentSettingBraintreePayPalStyle
    onClick: (data: unknown, actions: PayPalButtonsActions) => Promise<void>
    createOrder: () => Promise<string>
    onApprove: (data: Record<string, unknown>) => Promise<void>
    onCancel: () => void
    onError: (error: unknown) => void
  }) => PayPalButtonsInstance
}

/** PayPal's button style, passed through as PayPal documents it. */
export interface PaymentSettingBraintreePayPalStyle {
  layout?: "vertical" | "horizontal"
  color?: "gold" | "blue" | "silver" | "white" | "black"
  shape?: "rect" | "pill" | "sharp"
  label?: "paypal" | "checkout" | "buynow" | "pay"
  height?: number
  tagline?: boolean
}

export interface PaymentSettingBraintreePayPalChildrenProps {
  /** A payment is in flight: PayPal approved and Braintree is answering. */
  isSubmitting: boolean
  /**
   * The code behind the last failure: `TermsNotAccepted`, `GiftCardRefused`,
   * Braintree's own, or the authorization's status (`declined`, `failed`) when
   * Braintree refused the payment. Map it to copy in the checkout's language;
   * the `message` on `errors` is an English fallback.
   */
  lastErrorCode?: string
  errors: BaseError[]
}

interface Props {
  /**
   * Rendered after the button, and only when the button is — where an
   * application puts its error outlet, so nothing shows when PayPal is not
   * enabled on the Braintree merchant.
   */
  children?: ChildrenFunction<PaymentSettingBraintreePayPalChildrenProps>
  /** PayPal's button style. Defaults to a gold, 44px, tagline-free button. */
  style?: PaymentSettingBraintreePayPalStyle
  /** Class on the element PayPal renders its button into. */
  className?: string
}

const DEFAULT_STYLE: PaymentSettingBraintreePayPalStyle = {
  layout: "horizontal",
  color: "gold",
  shape: "rect",
  label: "paypal",
  height: 44,
  tagline: false,
}

/**
 * PayPal through Braintree, for an order on the `payment_sessions` model.
 *
 * Mounted inside `<PaymentSetting>` beside `<PaymentSettingBraintreePayment>`;
 * mounting it is what offers it, and it renders nothing when PayPal is not
 * enabled on the Braintree merchant.
 *
 * Commerce Layer handles a PayPal nonce exactly as a card's: on the same
 * Payment Session, through `client_data.payment_method_id`, charged by the
 * Payment Authorization — and it fills `payment_instrument` with the payer's
 * account. So everything that differs is in the browser, and it is the shape
 * PayPal has everywhere: a **Gateway-Owned Button**. Its popup needs the click
 * on PayPal's own button, so `<PlaceOrderButton>` cannot start it, and what the
 * place button does for a card happens inside PayPal's callbacks instead:
 *
 * - the privacy-and-terms gate and the gift cards on `onClick`, which PayPal
 *   awaits before the popup goes on — so a refused gift card or an unaccepted
 *   checkbox closes it before the shopper has done anything in it;
 * - the nonce handed to Commerce Layer on `onApprove`, and the order placed by
 *   `<PlaceOrderButton>` without a click, as an **Out-of-Band Collection**.
 *
 * The card fields stay live beside it: both are routes to one session.
 */
export function PaymentSettingBraintreePayPal(props: Props): JSX.Element | null {
  const { setting, currentPaymentSession, isSelected, readonly } = useContext(
    PaymentSettingChildrenContext
  )
  const isBraintree = setting?.type === BRAINTREE_SETTING_TYPE
  const clientToken = useStickySessionValue(currentPaymentSession, readBraintreeClientToken)

  // Only the selected setting's button is live: a payment taken through an
  // unselected setting would be taken on a session that is not the selection.
  const shouldMount = isBraintree && isSelected === true && readonly !== true
  if (!shouldMount || clientToken == null || currentPaymentSession == null) return null

  // Keyed on the token: Braintree is booted from it once, and a session
  // replaced after a refusal brings a new one.
  return (
    <PayPalButton
      key={clientToken}
      {...props}
      clientToken={clientToken}
      session={currentPaymentSession}
    />
  )
}

interface Booted {
  checkout: PayPalCheckout
  paypal: PayPalSdk
}

function PayPalButton({
  children,
  style,
  className,
  clientToken,
  session,
}: Props & { clientToken: string; session: PaymentSession }): JSX.Element | null {
  const { order, getOrder } = useContext(OrderContext)
  const { accessToken, interceptors } = useContext(CommerceLayerContext)
  const collectionPermitted = useCollectionPermitted()

  const [booted, setBooted] = useState<Booted | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [errors, setErrors] = useState<BaseError[]>([])
  const [lastErrorCode, setLastErrorCode] = useState<string | undefined>(undefined)
  const containerRef = useRef<HTMLDivElement | null>(null)

  const orderId = order?.id

  // The current values, for PayPal's callbacks, which fire long after render.
  const latestRef = useRef({
    order,
    getOrder,
    session,
    accessToken,
    interceptors,
    collectionPermitted,
  })
  latestRef.current = { order, getOrder, session, accessToken, interceptors, collectionPermitted }

  const fail = (code: string, message: string): BaseError => {
    const error = gatewayError(message, code)
    setLastErrorCode(code)
    setErrors([error])
    return error
  }

  // Boot Braintree and load PayPal's SDK, in the session's currency: the SDK is
  // loaded for one currency and the payment created later has to match it.
  // biome-ignore lint/correctness/useExhaustiveDependencies: booted once per token, through the component's `key`
  useEffect(() => {
    let cancelled = false
    let instance: PayPalCheckout | null = null

    void (async () => {
      try {
        const [clientModule, paypalCheckoutModule] = (
          await Promise.all([
            import("braintree-web/client"),
            import("braintree-web/paypal-checkout"),
          ])
        ).map(interopDefault)
        if (cancelled) return
        const client: Client = await clientModule.create({ authorization: clientToken })
        instance = (await paypalCheckoutModule.create({ client })) as PayPalCheckout
        if (cancelled) return
        await instance.loadPayPalSDK({
          currency: session.currency_code ?? undefined,
          // `authorize` whatever the setting does with the money: an approval
          // for an authorization can be charged straight away, while one for
          // `capture` refuses the plain authorization Commerce Layer makes
          // when the setting does not capture automatically.
          intent: "authorize",
          dataAttributes: { namespace: PAYPAL_NAMESPACE } as never,
        })
        if (cancelled) return
        const paypal = (globalThis as Record<string, unknown>)[PAYPAL_NAMESPACE] as
          | PayPalSdk
          | undefined
        if (paypal == null) throw new Error("PayPal's SDK did not load.")
        // Asked here rather than after rendering, so an ineligible PayPal
        // leaves no empty container and no children behind.
        if (!paypal.Buttons({ fundingSource: paypal.FUNDING.PAYPAL } as never).isEligible()) {
          throw new Error("PayPal is not eligible for this buyer or currency.")
        }
        setBooted({ checkout: instance, paypal })
      } catch (error) {
        // Not offered, and not the shopper's problem: most often PayPal is not
        // enabled on the Braintree merchant. An expired client token is the
        // card form's to renew; this button comes back with the new session.
        if (process.env.NODE_ENV !== "production") {
          console.warn(
            `[commercelayer] <PaymentSettingBraintreePayPal> not offered: ${
              braintreeErrorCode(error) ?? (error instanceof Error ? error.message : "unknown")
            }.`
          )
        }
      }
    })()

    return () => {
      cancelled = true
      // Removes the SDK's script too. The global stays behind, harmlessly: the
      // next mount loads a fresh script over it.
      if (instance != null) void instance.teardown().catch(() => {})
    }
  }, [])

  // Render PayPal's button once the SDK is there and the container exists.
  // biome-ignore lint/correctness/useExhaustiveDependencies: rendered once per boot; callbacks read `latestRef`
  useEffect(() => {
    if (booted == null || containerRef.current == null) return
    const { checkout, paypal } = booted

    const buttons = paypal.Buttons({
      fundingSource: paypal.FUNDING.PAYPAL,
      style: { ...DEFAULT_STYLE, ...style },
      onClick: async (_data, actions) => {
        await onClick(actions)
      },
      createOrder: async () => {
        const current = latestRef.current
        return await checkout.createPayment({
          flow: "checkout",
          intent: "authorize",
          // The session's amount — the remainder after the gift cards — in
          // the currency the SDK was loaded with.
          amount: sessionAmount(current.session),
          currency: current.session.currency_code ?? undefined,
        } as never)
      },
      onApprove: async (data) => {
        await onApprove(checkout, data)
      },
      onCancel: () => {
        // The popup was closed before approving: nothing reached Braintree.
        // The gift cards charged on the click stay charged and applied, as
        // after any interrupted payment — they count toward the next attempt.
        releasePopup()
        setIsSubmitting(false)
      },
      onError: (error) => {
        releasePopup()
        fail(braintreeErrorCode(error) ?? "PAYPAL_ERROR", "PayPal could not complete the payment.")
        setIsSubmitting(false)
      },
    })

    void buttons.render(containerRef.current).catch(() => {
      // The container went away while PayPal was rendering into it.
    })
    return () => {
      // This button registers nothing on the handoff, so no deregistration
      // clears the lock its popup took. Released here instead, or a button
      // unmounted under an open popup would leave the payment method locked
      // for the rest of the page. Only the popup's hold: an approval already
      // being authorized finishes on its own and releases it then.
      releasePopup()
      void buttons.close().catch(() => {})
    }
  }, [booted])

  /**
   * Whether this button's popup is open and holding the payment-method lock.
   * Tracked apart from the authorization that follows an approval, which
   * releases the lock itself, so an unmount can release exactly what it owns.
   */
  const popupOpenRef = useRef(false)
  const releasePopup = (): void => {
    if (!popupOpenRef.current) return
    popupOpenRef.current = false
    setCollecting(latestRef.current.order?.id, false)
  }

  /**
   * PayPal's click: the gate, then the gift cards — before the popup goes on.
   *
   * PayPal awaits this, so a round trip here is fine, unlike Apple Pay's click.
   * Rejecting closes the popup before the shopper has done anything in it.
   */
  async function onClick(actions: PayPalButtonsActions): Promise<void> {
    const current = latestRef.current
    if (!current.collectionPermitted) {
      fail("TermsNotAccepted", "Accept the terms and conditions to continue.")
      await actions.reject()
      return
    }
    if (current.order == null || current.accessToken == null) {
      fail("NotReady", "The payment could not be started.")
      await actions.reject()
      return
    }
    setErrors([])
    setLastErrorCode(undefined)
    try {
      const authorized = await authorizeGiftCardSessions({
        accessToken: current.accessToken,
        interceptors: current.interceptors,
        order: current.order,
      })
      if (authorized.errors.length > 0) {
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
        await actions.reject()
        return
      }
      // So the place sequence, which runs once this has collected, skips the
      // cards it would otherwise authorize a second time.
      if (authorized.authorizedSessionIds.length > 0) {
        await current.getOrder(current.order.id)
      }
    } catch {
      fail("GiftCardRefused", "The gift cards could not be charged.")
      await actions.reject()
      return
    }
    // Resolving opens the popup, and the payment method is locked until it
    // closes: switching would unmount this button under a popup the shopper can
    // still approve. Released by cancel, error, the approval taking over, or
    // this button going away.
    popupOpenRef.current = true
    setCollecting(current.order.id, true)
    await actions.resolve()
  }

  /** PayPal approved: hand the nonce to Commerce Layer and report the verdict. */
  async function onApprove(checkout: PayPalCheckout, data: Record<string, unknown>): Promise<void> {
    const current = latestRef.current
    // The popup's hold ends here; the authorization takes the lock over
    // without letting go of it in between.
    popupOpenRef.current = false
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
      let nonce: string
      try {
        nonce = (await checkout.tokenizePayment(data as never)).nonce
      } catch (error) {
        // Braintree could not turn PayPal's approval into a nonce: nothing has
        // been charged and the session is untouched, so the shopper may try
        // again.
        fail(
          braintreeErrorCode(error) ?? "TOKENIZATION_FAILED",
          "The payment could not be completed."
        )
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
        // Money taken and nobody pressed the place button: it takes the order
        // the rest of the way on its own.
        setOutOfBandCollection(orderId, "done")
        return
      }
      // A refusal burns the session and an unknown outcome must not be undone:
      // both are the place button's to handle, and the gift cards stay where
      // they are either way.
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

  if (booted == null) return null

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

export default PaymentSettingBraintreePayPal
