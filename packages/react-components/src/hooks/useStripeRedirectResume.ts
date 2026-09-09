import {
  findCurrentPaymentSession,
  hasLiveAuthorization,
  isStripeSession,
  readStripeClientSecret,
} from "@commercelayer/core-components"
import type { Order } from "@commercelayer/sdk"
import { loadStripe } from "@stripe/stripe-js"
import { useContext, useEffect, useRef } from "react"
import OrderContext from "#context/OrderContext"
import type { BaseError } from "#typings/errors"
import { setOutOfBandCollection } from "#utils/paymentGatewayStore"

/**
 * Stripe's own return parameters. Only the first is read; the others are
 * dropped so a reload cannot revive a finished return.
 */
const CLIENT_SECRET_PARAM = "payment_intent_client_secret"
const RETURN_PARAMS = [CLIENT_SECRET_PARAM, "payment_intent", "redirect_status"] as const

/**
 * PaymentIntent statuses that mean the money is there.
 *
 * Same set as the payment component's, and for the same reason:
 * `capture_method` is `manual` unless the setting captures automatically, so a
 * successful authorization stops at `requires_capture`.
 */
const MONEY_TAKEN = ["succeeded", "requires_capture", "processing"] as const

/**
 * Secrets already handled, process-wide rather than per component.
 *
 * Two `<PaymentSetting>` trees on a page, or a remount before the order
 * refetch lands, would otherwise each report the same return — and the second
 * report would arrive after the place sequence had already started.
 */
const handled = new Set<string>()

/**
 * Finish a redirect the shopper has just come back from on a Stripe session.
 *
 * The methods that redirect are chosen by the shopper inside the Payment
 * Element, not by us: the intent is created with
 * `automatic_payment_methods: { allow_redirects: "always" }`, so whatever the
 * Stripe Dashboard has enabled can take the browser away. That makes this hook
 * part of the card iteration and not a later one.
 *
 * **Why the order and not the query string.** Stripe puts the client secret in
 * the URL and the intent could be retrieved from that alone. It is read from
 * `payment_session.response_data` instead, and the URL value is used only to
 * notice that a return happened and to match it: the order is the single source
 * of truth on this model, and a secret that does not match the session we know
 * about is not ours to act on.
 *
 * **Why a hook and not a component.** Retrieving an intent needs no DOM — no
 * Elements group, no mount — so this can live in `<PaymentSetting>`, which the
 * Payment Session lifecycle already keeps mounted. Inside the payment component
 * it would depend on which step the application happens to render, and a
 * checkout that comes back with the payment step collapsed would leave a
 * charged card on an unplaced order.
 *
 * It reports through the Payment Gateway Handoff as an **Out-of-Band
 * Collection** and does nothing else. Placing is `<PlaceOrderButton>`'s, which
 * watches for `collectedOutOfBand: "done"`.
 */
export function useStripeRedirectResume(): void {
  const { order, getOrder } = useContext(OrderContext)

  // Rebuilt on every render of the order provider, so depending on it would
  // re-run this effect constantly. Only the order itself should.
  const getOrderRef = useRef(getOrder)
  getOrderRef.current = getOrder

  useEffect(() => {
    if (typeof window === "undefined") return

    const returned = new URLSearchParams(window.location.search).get(CLIENT_SECRET_PARAM)
    if (returned == null || returned === "") return
    if (handled.has(returned)) return

    // The order has not arrived with its sessions yet. Leave the parameter for a
    // later render rather than claiming it now.
    if (order?.payment_sessions == null) return

    const secret = findStripeSecretToResume(order)

    // Claimed and cleaned either way: with nothing to resume the check must not
    // repeat on every render, and a reload must not report a finished return a
    // second time.
    handled.add(returned)
    cleanUrl()
    if (secret == null || secret !== returned) return

    void resumeRedirect({
      orderId: order.id,
      publishableKey: findPublishableKey(order),
      clientSecret: secret,
      refetch: async (id) => {
        await getOrderRef.current(id)
      },
    })
  }, [order])
}

interface ResumeRedirectParams {
  orderId: string
  publishableKey?: string
  clientSecret: string
  refetch: (orderId: string) => Promise<void>
}

/**
 * Ask Stripe what became of the intent, and report it.
 *
 * Module-level rather than a closure, so the effect depends on the order alone.
 */
async function resumeRedirect({
  orderId,
  publishableKey,
  clientSecret,
  refetch,
}: ResumeRedirectParams): Promise<void> {
  setOutOfBandCollection(orderId, "in-progress")

  try {
    if (publishableKey == null) throw new Error("The payment setting has no publishable key.")
    const stripe = await loadStripe(publishableKey)
    if (stripe == null) throw new Error("Stripe could not be loaded.")

    const { paymentIntent, error } = await stripe.retrievePaymentIntent(clientSecret)
    if (error != null) {
      const code = error.code ?? error.type ?? "Error"
      // Retrieving failed, which says nothing about the payment itself: it may
      // well have succeeded. An unknown outcome is reported as a failure of
      // *this attempt* and nothing is rolled back — the place button does not
      // refund on an out-of-band failure, by design.
      setOutOfBandCollection(orderId, "failed", [
        resumeError(code, error.message ?? "The payment could not be confirmed."),
      ])
      return
    }

    const status = paymentIntent?.status
    if (status != null && MONEY_TAKEN.includes(status as (typeof MONEY_TAKEN)[number])) {
      setOutOfBandCollection(orderId, "done")
      return
    }
    setOutOfBandCollection(orderId, "failed", [
      resumeError(status ?? "unknown", "The payment was not completed."),
    ])
  } catch (error) {
    setOutOfBandCollection(orderId, "failed", [
      resumeError(
        "SetupFailed",
        error instanceof Error ? error.message : "The payment could not be confirmed."
      ),
    ])
  } finally {
    // The order moved on while the shopper was away — Stripe's webhook may
    // already have settled or refused the payment — so pull the truth back in
    // rather than deciding from a pre-redirect copy.
    try {
      await refetch(orderId)
    } catch {
      // The resume outcome is what matters; a failed refetch must not replace it
      // with a second, less useful error.
    }
  }
}

/**
 * The secret of the Stripe session this return belongs to, if there is one to
 * finish.
 *
 * A session already carrying a live authorization is skipped: the payment has
 * been picked up, and reporting the return again would start a second place.
 */
function findStripeSecretToResume(order: Order): string | undefined {
  const session = findCurrentPaymentSession({ paymentSessions: order.payment_sessions })
  if (session == null || !isStripeSession(session)) return undefined
  if (hasLiveAuthorization(session)) return undefined
  return readStripeClientSecret(session)
}

function findPublishableKey(order: Order): string | undefined {
  const session = findCurrentPaymentSession({ paymentSessions: order.payment_sessions })
  const setting = (order.available_payment_settings ?? []).find(
    (candidate) => candidate.id === session?.payment_setting?.id
  )
  const key = (setting as { public_key?: string | null } | undefined)?.public_key
  return typeof key === "string" && key !== "" ? key : undefined
}

/**
 * Drop Stripe's return parameters from the address bar.
 *
 * `replaceState` rather than a navigation, so the shopper's history is not
 * disturbed and nothing remounts mid-resume.
 */
function cleanUrl(): void {
  const url = new URL(window.location.href)
  for (const param of RETURN_PARAMS) url.searchParams.delete(param)
  window.history.replaceState(window.history.state, "", url.toString())
}

/**
 * `resource: "orders"` because `<PlaceOrderButton>` puts these into the order's
 * error store, and `<Errors>` matches on `resource` — so any other tag makes the
 * message invisible in the outlet consumers actually mount.
 */
function resumeError(code: string, message: string): BaseError {
  return {
    code: "PAYMENT_INTENT_AUTHENTICATION_FAILURE",
    resource: "orders",
    message,
    meta: { error: code },
  }
}

export default useStripeRedirectResume
