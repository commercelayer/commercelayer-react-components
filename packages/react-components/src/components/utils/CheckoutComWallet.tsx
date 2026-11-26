import {
  type ApplepayComponentOptions,
  type Component,
  type GooglepayComponentOptions,
  loadCheckoutWebComponents,
  type OnAuthorizedResponse,
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
import { useCollectionPermitted } from "#hooks/useCollectionPermitted"
import { useStickySessionValue } from "#hooks/useStickySessionValue"
import type { BaseError } from "#typings/errors"
import type { ChildrenFunction } from "#typings/index"
import { checkoutComError, checkoutComOutcome, isSandboxKey } from "#utils/checkoutCom"
import { isCollecting, setCollecting, setOutOfBandCollection } from "#utils/paymentGatewayStore"
import { authorizeWalletGiftCards, type GiftCardReconciliation } from "#utils/walletGiftCards"

/** The wallets Checkout.com has a component of its own for. */
export type CheckoutComWalletMethod = "applepay" | "googlepay"

/**
 * The options this component owns, because the order the money is taken in
 * depends on them: the gate on the click, the gift cards on authorization,
 * and the outcome reported to `<PlaceOrderButton>`.
 */
type OwnedWalletOption =
  | "handleClick"
  | "onAuthorized"
  | "onPaymentCompleted"
  | "onError"
  | "onReady"
  | "onSubmit"
  | "handleSubmit"
  | "mode"

export type CheckoutComWalletOptions<M extends CheckoutComWalletMethod> = Omit<
  M extends "applepay" ? ApplepayComponentOptions : GooglepayComponentOptions,
  OwnedWalletOption
>

export interface PaymentSettingCheckoutComWalletChildrenProps {
  /**
   * A payment is in flight: the shopper confirmed in the wallet's sheet, and
   * the gift cards and Checkout.com are answering.
   */
  isSubmitting: boolean
  /**
   * The code behind the last failure: `TermsNotAccepted`, `GiftCardRefused`,
   * Checkout.com's decline reason, or its error code. Map it to copy in the
   * checkout's language; the `message` on `errors` is an English fallback.
   */
  lastErrorCode?: string
  errors: BaseError[]
}

export interface CheckoutComWalletProps<M extends CheckoutComWalletMethod> {
  /**
   * Rendered after the button, and only when the button is: an application
   * puts its "or pay by card" divider and its error outlet here, so neither
   * shows on a browser that cannot pay with this wallet.
   */
  children?: ChildrenFunction<PaymentSettingCheckoutComWalletChildrenProps>
  /**
   * Options for Checkout.com's web components: `appearance`, `locale`,
   * `translations`. The public key, the payment session and the environment
   * come from the setting and the Payment Session.
   */
  options?: Omit<Options, "publicKey" | "paymentSession" | "environment">
  /**
   * Options for the wallet's component: `buttonType`, `buttonColor`,
   * `acceptedCardSchemes`, and so on. The callbacks are this component's: see
   * `OwnedWalletOption`.
   */
  walletOptions?: CheckoutComWalletOptions<M>
  /** Class on the element the wallet's button is mounted into. */
  className?: string
}

/**
 * Apple Pay or Google Pay through Checkout.com, for an order on the
 * `payment_sessions` model: the implementation behind
 * `<PaymentSettingCheckoutComApplePay>` and `<PaymentSettingCheckoutComGooglePay>`.
 *
 * Mounted beside `<PaymentSettingCheckoutComPayment>`, on the same Payment
 * Session: the card form stays live, and this button pays through the wallet's
 * sheet. It renders only when Checkout.com's payment session offers the wallet
 * and the browser can pay with it, and nothing at all otherwise.
 *
 * It owns its click, so what the place button does for a card happens here
 * instead, at the moments Checkout.com allows:
 *
 * - **`handleClick`**, before the sheet opens: the privacy-and-terms gate, and
 *   a refusal while another payment is already under way. Answered at once,
 *   with nothing awaited: the wallet opens its sheet only inside the click's
 *   gesture.
 * - **`onAuthorized`**, once the shopper has confirmed in the sheet and before
 *   anything reaches Checkout.com: the payment lock and the gift cards. A gift
 *   card that cannot be charged stops the payment there, so a refused gift card
 *   never leaves the wallet charged.
 * - **`onPaymentCompleted`**: the payment id written into the session, and the
 *   collection reported `done` out of band. `<PlaceOrderButton>` places the
 *   order without a click.
 *
 * **Why the lock waits for `onAuthorized`.** Checkout.com raises nothing when
 * the shopper closes the sheet without paying — checked on the sandbox, where
 * no callback came 25 seconds after the sheet was closed, and the next click
 * opened it again. Taken on the click, the lock would never be released, and
 * the shopper could not change payment method again.
 *
 * A wallet payment that ends in a redirect comes back through `<PaymentSetting>`
 * like a card's.
 */
export function CheckoutComWallet<M extends CheckoutComWalletMethod>({
  method,
  ...props
}: CheckoutComWalletProps<M> & { method: M }): JSX.Element | null {
  const { setting, currentPaymentSession, isSelected, readonly } = useContext(
    PaymentSettingChildrenContext
  )
  const isCheckoutCom = setting?.type === CHECKOUT_COM_SETTING_TYPE
  const publicKey = (setting as { public_key?: string | null } | undefined)?.public_key
  const paymentSession = useStickySessionValue(currentPaymentSession, readCheckoutComPaymentSession)

  // Only the selected setting's button is live, for the reason the card form's
  // is: a payment taken through an unselected setting is taken on a session
  // that is not the order's selection.
  const shouldMount = isCheckoutCom && isSelected === true && readonly !== true
  if (
    !shouldMount ||
    publicKey == null ||
    publicKey === "" ||
    paymentSession == null ||
    currentPaymentSession == null
  ) {
    return null
  }

  // Keyed on Checkout.com's payment session, which a component is built from
  // and cannot be moved off.
  return (
    <WalletButton
      key={String((paymentSession as { id?: unknown }).id)}
      {...props}
      method={method}
      publicKey={publicKey}
      paymentSession={paymentSession}
      currentPaymentSession={currentPaymentSession}
    />
  )
}

interface WalletButtonProps<M extends CheckoutComWalletMethod> extends CheckoutComWalletProps<M> {
  method: M
  publicKey: string
  paymentSession: Record<string, unknown>
  currentPaymentSession: PaymentSession
}

function WalletButton<M extends CheckoutComWalletMethod>({
  children,
  options,
  walletOptions,
  className,
  method,
  publicKey,
  paymentSession,
  currentPaymentSession,
}: WalletButtonProps<M>): JSX.Element | null {
  const { order, getOrder } = useContext(OrderContext)
  const { accessToken, interceptors } = useContext(CommerceLayerContext)
  const collectionPermitted = useCollectionPermitted()

  const containerRef = useRef<HTMLDivElement | null>(null)
  const [isAvailable, setIsAvailable] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [errors, setErrors] = useState<BaseError[]>([])
  const [lastErrorCode, setLastErrorCode] = useState<string | undefined>(undefined)

  // The current values, for Checkout.com's callbacks, which fire long after
  // the component was created.
  const latestRef = useRef({
    order,
    getOrder,
    accessToken,
    interceptors,
    collectionPermitted,
    currentPaymentSession,
  })
  latestRef.current = {
    order,
    getOrder,
    accessToken,
    interceptors,
    collectionPermitted,
    currentPaymentSession,
  }

  /** The wallet's component, once Checkout.com says it is available. */
  const componentRef = useRef<Component | null>(null)
  /** Whether this button still exists, for a sheet confirmed after it went away. */
  const mountedRef = useRef(true)
  /**
   * Whether this button holds the payment lock: from `onAuthorized` to the
   * outcome. Tracked so that an unmount releases exactly what it owns.
   */
  const payingRef = useRef(false)
  /** See `authorizeWalletGiftCards`: kept across attempts in the same sheet. */
  const reconciliationRef = useRef<GiftCardReconciliation>({ pending: false })

  const fail = (code: string, message: string): BaseError => {
    const error = checkoutComError(message, code)
    setLastErrorCode(code)
    setErrors([error])
    return error
  }

  const release = (): void => {
    if (!payingRef.current) return
    payingRef.current = false
    setIsSubmitting(false)
    setCollecting(latestRef.current.order?.id, false)
  }

  /** The click, before the sheet opens. Nothing awaited. */
  const handleClick = async (): Promise<{ continue: boolean }> => {
    const current = latestRef.current
    // Another route is already paying on this session — the card form, or
    // this wallet's own previous attempt — and a second one would race it.
    if (isCollecting(current.order?.id)) return { continue: false }
    if (!current.collectionPermitted) {
      // The only place this can be said: the shopper pressed the wallet's
      // button, not ours, and it has no disabled state to show instead.
      fail("TermsNotAccepted", "Accept the terms and conditions to continue.")
      return { continue: false }
    }
    setErrors([])
    setLastErrorCode(undefined)
    // A new sheet starts from the order the context holds by now.
    reconciliationRef.current.order = undefined
    return { continue: true }
  }

  /** Confirmed in the sheet: the lock, then the gift cards. */
  const onAuthorized = async (): Promise<OnAuthorizedResponse> => {
    const current = latestRef.current
    const orderId = current.order?.id
    if (!mountedRef.current || current.order == null || current.accessToken == null) {
      return { continue: false, errorMessage: "The payment could not be started." }
    }
    // The card form may have started a payment while the sheet was open.
    if (!payingRef.current && isCollecting(orderId)) {
      return { continue: false, errorMessage: "Another payment is in progress." }
    }
    payingRef.current = true
    setIsSubmitting(true)
    // From here a payment is under way that nothing on the order records yet:
    // nothing may delete this session, and the method cannot be switched.
    setCollecting(orderId, true)

    const charged = await authorizeWalletGiftCards({
      accessToken: current.accessToken,
      interceptors: current.interceptors,
      order: current.order,
      getOrder: current.getOrder,
      reconciliation: reconciliationRef.current,
    })
    if (charged.status !== "charged") {
      if (charged.status === "refused") {
        setLastErrorCode("GiftCardRefused")
        setErrors(charged.errors)
      } else {
        fail(charged.code, charged.message)
      }
      release()
      return { continue: false, errorMessage: charged.message }
    }

    setErrors([])
    setLastErrorCode(undefined)
    // The place button shows the order as busy while the wallet pays.
    setOutOfBandCollection(orderId, "in-progress")
    return { continue: true }
  }

  /** Checkout.com approved the payment: record it, then let the order be placed. */
  const onPaymentCompleted = async (paymentId: string): Promise<void> => {
    const current = latestRef.current
    const orderId = current.order?.id
    try {
      if (current.accessToken == null)
        throw new Error("No access token to record the payment with.")
      await recordCheckoutComPayment({
        accessToken: current.accessToken,
        interceptors: current.interceptors,
        paymentSessionId: current.currentPaymentSession.id,
        clientData: current.currentPaymentSession.client_data as
          | Record<string, unknown>
          | null
          | undefined,
        paymentId,
      })
      setOutOfBandCollection(orderId, "done")
    } catch (error) {
      // The money is taken and the API does not know it. Reported, and never
      // rolled back: the place button does not refund on an out-of-band failure.
      const reported = fail(
        "payment_not_recorded",
        error instanceof Error && error.message !== ""
          ? error.message
          : "The payment could not be recorded."
      )
      setOutOfBandCollection(orderId, "failed", [reported])
    } finally {
      release()
    }
  }

  /** An error, during a payment of this button's or outside one. */
  const onError = (code: string, message: string): void => {
    const orderId = latestRef.current.order?.id
    const error = fail(code, message)
    if (!payingRef.current) return
    // A refusal and an unknown outcome are both the place button's to handle,
    // as for the Braintree wallets: neither is rolled back.
    setOutOfBandCollection(orderId, "failed", [error])
    release()
  }

  // The latest callbacks, for a component created once.
  const callbacksRef = useRef({ handleClick, onAuthorized, onPaymentCompleted, onError })
  callbacksRef.current = { handleClick, onAuthorized, onPaymentCompleted, onError }

  // Create the wallet's component once per Checkout.com payment session, which
  // the parent keys this on, and mount it only where the browser can pay.
  // biome-ignore lint/correctness/useExhaustiveDependencies: created once, callbacks read through a ref
  useEffect(() => {
    mountedRef.current = true
    let cancelled = false
    let component: Component | null = null

    void (async () => {
      try {
        const checkout = await loadCheckoutWebComponents({
          ...options,
          publicKey,
          paymentSession,
          environment: isSandboxKey(publicKey) ? "sandbox" : "production",
        })
        if (cancelled) return
        // Typed as Google Pay's for `create`'s sake: the two wallets take the
        // same callbacks, and differ only in options the application passes.
        const walletComponentOptions: GooglepayComponentOptions = {
          ...(walletOptions as GooglepayComponentOptions | undefined),
          handleClick: () => callbacksRef.current.handleClick(),
          onAuthorized: () => callbacksRef.current.onAuthorized(),
          onPaymentCompleted: (_component, payment) => {
            void callbacksRef.current.onPaymentCompleted(payment.id)
          },
          onError: (_component, error) => {
            const outcome = checkoutComOutcome(error)
            callbacksRef.current.onError(
              outcome.status === "failed" || outcome.status === "unknown"
                ? outcome.code
                : error.code,
              error.message
            )
          },
        }
        component = checkout.create(method as "googlepay", walletComponentOptions)
        // Required before mounting a component other than Flow, and the answer
        // to whether this wallet is offered: the payment session has to list
        // it, and the browser has to support it.
        const available = await component.isAvailable()
        if (cancelled || !available) return
        componentRef.current = component
        setIsAvailable(true)
      } catch (error) {
        // Not offered, and not the shopper's problem.
        if (process.env.NODE_ENV !== "production") {
          console.warn(
            `[commercelayer] Checkout.com ${method} not offered: ${
              error instanceof Error ? error.message : "unknown"
            }.`
          )
        }
      }
    })()

    return () => {
      cancelled = true
      mountedRef.current = false
      // A payment still in flight when the button goes away must not leave the
      // payment method locked for the rest of the page.
      release()
      try {
        component?.unmount()
      } catch {
        // Never mounted, or already gone.
      }
      componentRef.current = null
    }
  }, [])

  // Mounted once the container exists, which is only after `isAvailable`:
  // nothing is rendered for a wallet that is not offered.
  useEffect(() => {
    const container = containerRef.current
    if (!isAvailable || container == null) return
    componentRef.current?.mount(container)
  }, [isAvailable])

  if (!isAvailable) return null

  return (
    <>
      <div ref={containerRef} className={className} />
      {children != null ? (
        <Parent {...{ isSubmitting, lastErrorCode, errors }}>{children}</Parent>
      ) : null}
    </>
  )
}
