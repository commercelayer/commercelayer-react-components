import {
  CHECKOUT_COM_RETURN_PARAM,
  findCurrentPaymentSession,
  hasLiveAuthorization,
  isCheckoutComSession,
  recordCheckoutComPayment,
} from "@commercelayer/core-components"
import type { Order, PaymentSession } from "@commercelayer/sdk"
import { useContext, useEffect, useRef } from "react"
import CommerceLayerContext from "#context/CommerceLayerContext"
import OrderContext from "#context/OrderContext"
import type { BaseError } from "#typings/errors"
import { setOutOfBandCollection } from "#utils/paymentGatewayStore"

/** The payment id Checkout.com appends after a payment its web components made. */
const PAYMENT_ID_PARAM = "cko-payment-id"

/**
 * Everything a return carries, ours and Checkout.com's. All of it is dropped
 * once read, so a reload cannot report a finished return a second time.
 */
const RETURN_PARAMS = [
  CHECKOUT_COM_RETURN_PARAM,
  PAYMENT_ID_PARAM,
  "cko-session-id",
  "cko-payment-session-id",
] as const

/**
 * Returns already handled, process-wide rather than per component, for the
 * reason the Stripe hook gives: two `<PaymentSetting>` trees, or a remount
 * before the refetch lands, would otherwise each report the same return.
 */
const handled = new Set<string>()

/**
 * Finish a 3DS redirect the shopper has just come back from on a Checkout.com
 * session.
 *
 * Checkout.com's card component authenticates in place when it can and sends
 * the shopper to the issuer when it cannot. They come back to the session's
 * `success_url` or `failure_url`, which `<PaymentSetting>` created it with, and
 * Checkout.com appends the payment id to either. The web components are gone by
 * then, so the `onPaymentCompleted` that would have recorded the payment never
 * runs: this records it instead.
 *
 * - **Success:** the payment id goes into the session's `client_data`, exactly
 *   as on the in-page path, and the collection is reported `done`. The
 *   authorization is `<PlaceOrderButton>`'s, which reads the payment from
 *   Checkout.com through the API — so whether it really succeeded is decided
 *   there, by the API, and not by which URL the shopper landed on.
 * - **Failure:** reported `failed`, and nothing is recorded. A declined payment
 *   written into the session would only produce a failed authorization.
 *
 * A hook in `<PaymentSetting>`, like the other gateways' resumes, because it
 * needs no DOM: inside the payment component it would depend on which step the
 * application happens to render.
 */
export function useCheckoutComRedirectResume(): void {
  const { order, getOrder } = useContext(OrderContext)
  const { accessToken, interceptors } = useContext(CommerceLayerContext)

  // Rebuilt on every render of their providers, so depending on them would
  // re-run this effect constantly. Only the order itself should.
  const latestRef = useRef({ getOrder, accessToken, interceptors })
  latestRef.current = { getOrder, accessToken, interceptors }

  useEffect(() => {
    if (typeof window === "undefined") return

    const params = new URLSearchParams(window.location.search)
    const outcome = params.get(CHECKOUT_COM_RETURN_PARAM)
    if (outcome !== "success" && outcome !== "failure") return

    // The order has not arrived with its sessions yet. Leave the parameters for
    // a later render rather than claiming them now.
    if (order?.payment_sessions == null) return

    const paymentId = params.get(PAYMENT_ID_PARAM)
    const key = `${order.id}:${outcome}:${paymentId ?? ""}`
    if (handled.has(key)) return

    // Claimed and cleaned either way: with nothing to resume the check must not
    // repeat on every render, and a reload must not report it a second time.
    handled.add(key)
    cleanUrl()

    const session = findCheckoutComSessionToResume(order)
    if (session == null) return

    if (outcome === "failure") {
      setOutOfBandCollection(order.id, "failed", [
        resumeError("declined", "The payment was not completed."),
      ])
      return
    }

    // A success without a payment id is a payment the API submitted — a stored
    // card — whose authorization already exists and settles on the webhook.
    // This library does not make those yet, so there is nothing of ours to
    // finish.
    if (paymentId == null || paymentId === "") return

    const { accessToken: token, interceptors: requestInterceptors } = latestRef.current
    if (token == null) return

    void resumeRedirect({
      orderId: order.id,
      session,
      paymentId,
      accessToken: token,
      interceptors: requestInterceptors,
      refetch: async (id) => {
        await latestRef.current.getOrder(id)
      },
    })
  }, [order])
}

interface ResumeRedirectParams {
  orderId: string
  session: PaymentSession
  paymentId: string
  accessToken: string
  interceptors?: Parameters<typeof recordCheckoutComPayment>[0]["interceptors"]
  refetch: (orderId: string) => Promise<void>
}

/** Record the payment the shopper came back from, and report it. */
async function resumeRedirect({
  orderId,
  session,
  paymentId,
  accessToken,
  interceptors,
  refetch,
}: ResumeRedirectParams): Promise<void> {
  setOutOfBandCollection(orderId, "in-progress")
  try {
    await recordCheckoutComPayment({
      accessToken,
      interceptors,
      paymentSessionId: session.id,
      clientData: session.client_data as Record<string, unknown> | null | undefined,
      paymentId,
    })
    setOutOfBandCollection(orderId, "done")
  } catch (error) {
    // The payment went through on Checkout.com and the API does not know it.
    // Reported as a failure of this attempt, and nothing is rolled back: the
    // place button never refunds on an out-of-band failure.
    setOutOfBandCollection(orderId, "failed", [
      resumeError(
        "payment_not_recorded",
        error instanceof Error && error.message !== ""
          ? error.message
          : "The payment could not be confirmed."
      ),
    ])
  } finally {
    try {
      await refetch(orderId)
    } catch {
      // The resume outcome is what matters; a failed refetch must not replace it
      // with a second, less useful error.
    }
  }
}

/**
 * The Checkout.com session this return belongs to, if there is one to finish.
 *
 * One already carrying a live authorization is skipped: the payment has been
 * picked up, and reporting the return again would start a second place.
 */
function findCheckoutComSessionToResume(order: Order): PaymentSession | undefined {
  const session = findCurrentPaymentSession({ paymentSessions: order.payment_sessions })
  if (session == null || !isCheckoutComSession(session)) return undefined
  if (hasLiveAuthorization(session)) return undefined
  return session
}

/**
 * Drop the return parameters from the address bar, with `replaceState` so the
 * shopper's history is not disturbed and nothing remounts mid-resume.
 */
function cleanUrl(): void {
  const url = new URL(window.location.href)
  for (const param of RETURN_PARAMS) url.searchParams.delete(param)
  window.history.replaceState(window.history.state, "", url.toString())
}

/**
 * `resource: "orders"` because `<PlaceOrderButton>` puts these into the order's
 * error store, and `<Errors>` matches on `resource`.
 */
function resumeError(code: string, message: string): BaseError {
  return {
    code: "PAYMENT_INTENT_AUTHENTICATION_FAILURE",
    resource: "orders",
    message,
    meta: { error: code },
  }
}

export default useCheckoutComRedirectResume
