import { AdyenCheckout, type CoreConfiguration } from "@adyen/adyen-web/auto"
import {
  findCurrentPaymentSession,
  hasLiveAuthorization,
  isAdyenSession,
  readAdyenSession,
} from "@commercelayer/core-components"
import type { Order } from "@commercelayer/sdk"
import { useContext, useEffect, useRef } from "react"
import OrderContext from "#context/OrderContext"
import type { BaseError } from "#typings/errors"
import { setPaymentGatewayResume } from "#utils/paymentGatewayStore"

/** Adyen's own return parameters. `sessionId` is read for nothing but cleanup. */
const REDIRECT_RESULT_PARAM = "redirectResult"
const SESSION_ID_PARAM = "sessionId"

/**
 * `redirectResult` values already handled, process-wide.
 *
 * Adyen rejects a second submission of the same value, so this must not be
 * per-component: two `<PaymentSetting>` trees on one page, or a remount before
 * the order refetch lands, would otherwise both submit it and the second would
 * report a failure on a payment that succeeded.
 */
const handled = new Set<string>()

/**
 * Complete a 3DS redirect the shopper has just come back from.
 *
 * **Why this is a hook and not a component.** `submitDetails` is a method on
 * `adyen-web`'s core, not on the Drop-in, so finishing a redirect needs no DOM
 * at all — no container, no mount, no UI. That is what lets it live in
 * `<PaymentSetting>`, which the Payment Session lifecycle already requires to
 * stay mounted. Put it in `<PaymentSettingAdyenPayment>` instead and it would
 * depend on the application's decision about which checkout step to render: an
 * accordion that comes back collapsed would leave a charged card on an unplaced
 * order.
 *
 * **Why the order and not the query string.** Adyen returns both `sessionId`
 * and `redirectResult`, and its own documentation has integrators rebuild the
 * checkout from the former. We read `{ id, sessionData }` from
 * `payment_session.response_data` instead: it is the same pair, it is the
 * version that survives a different browser, cleared storage or private mode —
 * where `adyen-web`'s `localStorage` cache silently is not there — and it keeps
 * the order the single source of truth, as everything else on this model does.
 *
 * The URL is cleaned as soon as the value is read, because `redirectResult` is
 * single-use: a reload timed after the submit would otherwise surface a failure
 * on a payment that went through.
 *
 * This reports the outcome through the Payment Gateway Handoff and does nothing
 * else. Placing the order is `<PlaceOrderButton>`'s, which watches for
 * `resumePhase: "resumed"`; recovering from a refusal is
 * `<PaymentSettingAdyenPayment>`'s, which owns the Payment Session's
 * replacement. Neither belongs in a detection hook.
 */
export function useAdyenRedirectResume(): void {
  const { order, getOrder } = useContext(OrderContext)

  // `getOrder` is rebuilt on every render of the order provider, so depending on
  // it would re-run this effect constantly. Only the order itself should.
  const getOrderRef = useRef(getOrder)
  getOrderRef.current = getOrder

  useEffect(() => {
    if (typeof window === "undefined") return

    const redirectResult = new URLSearchParams(window.location.search).get(REDIRECT_RESULT_PARAM)
    if (redirectResult == null || redirectResult === "") return
    if (handled.has(redirectResult)) return

    // The order has not arrived with its sessions yet. Leave the parameter in
    // the URL — a later render will find it — rather than burning it now.
    if (order?.payment_sessions == null) return

    const target = findAdyenSessionToResume(order)

    // Claimed and cleaned either way: if there is nothing to resume the check
    // must not repeat on every render, and a reload must not revive a value
    // Adyen will refuse a second time.
    handled.add(redirectResult)
    cleanUrl()
    if (target == null) return

    void resumeRedirect({
      orderId: order.id,
      target,
      redirectResult,
      refetch: async (id) => {
        await getOrderRef.current(id)
      },
    })
  }, [order])
}

interface ResumeRedirectParams {
  orderId: string
  target: ResumeTarget
  redirectResult: string
  refetch: (orderId: string) => Promise<void>
}

/**
 * Hand the authentication result back to Adyen and report what it says.
 *
 * Module-level rather than a closure inside the effect so the effect depends on
 * the order and nothing else.
 */
async function resumeRedirect({
  orderId,
  target,
  redirectResult,
  refetch,
}: ResumeRedirectParams): Promise<void> {
  setPaymentGatewayResume(orderId, "resuming")

  try {
    const core = await AdyenCheckout({
      clientKey: target.clientKey,
      environment: target.clientKey.startsWith("test_") ? "test" : "live",
      session: { id: target.adyen.id, sessionData: target.adyen.sessionData },
      showPayButton: false,
      onPaymentCompleted: () => {
        setPaymentGatewayResume(orderId, "resumed")
      },
      onPaymentFailed: (data) => {
        const code = readResultCode(data) ?? "Refused"
        setPaymentGatewayResume(orderId, "failed", [resumeError(code, code)])
      },
      onError: (error) => {
        const code = error?.name ?? "Error"
        setPaymentGatewayResume(orderId, "failed", [resumeError(code, error?.message ?? code)])
      },
    } satisfies CoreConfiguration)

    // Not the Drop-in's `handleAction` — this is the core's own relay, which
    // posts `{ sessionData, details }` to `/sessions/{id}/paymentDetails` and
    // then fires the callbacks above. It returns `void`; every outcome arrives
    // asynchronously.
    core.submitDetails({ details: { redirectResult } })
  } catch (error) {
    setPaymentGatewayResume(orderId, "failed", [
      resumeError(
        "SetupFailed",
        error instanceof Error ? error.message : "The payment could not be completed."
      ),
    ])
  } finally {
    // Whatever happened, the order moved on while the shopper was away —
    // Adyen's webhook may already have settled or refused the payment — so pull
    // the truth back in rather than deciding from a pre-redirect copy.
    try {
      await refetch(orderId)
    } catch {
      // The resume outcome is what matters; a failed refetch must not replace it
      // with a second, less useful error.
    }
  }
}

interface ResumeTarget {
  clientKey: string
  adyen: { id: string; sessionData: string }
}

/**
 * The Adyen Payment Session this redirect belongs to, if there is one to finish.
 *
 * A session that already carries a live authorization is skipped: the payment
 * has been picked up, and re-submitting the details would be a second attempt
 * on a settled payment.
 */
function findAdyenSessionToResume(order: Order): ResumeTarget | undefined {
  const session = findCurrentPaymentSession({ paymentSessions: order.payment_sessions })
  if (session == null || !isAdyenSession(session)) return undefined
  if (hasLiveAuthorization(session)) return undefined

  const adyen = readAdyenSession(session)
  if (adyen == null) return undefined

  const setting = (order.available_payment_settings ?? []).find(
    (candidate) => candidate.id === session.payment_setting?.id
  )
  const clientKey = (setting as { public_key?: string | null } | undefined)?.public_key
  if (typeof clientKey !== "string" || clientKey === "") return undefined

  return { clientKey, adyen }
}

/**
 * Drop Adyen's return parameters from the address bar.
 *
 * `replaceState` rather than a navigation, so the shopper's history is not
 * disturbed and nothing remounts mid-resume.
 */
function cleanUrl(): void {
  const url = new URL(window.location.href)
  url.searchParams.delete(REDIRECT_RESULT_PARAM)
  url.searchParams.delete(SESSION_ID_PARAM)
  window.history.replaceState(window.history.state, "", url.toString())
}

function readResultCode(data: unknown): string | undefined {
  if (data == null || typeof data !== "object") return undefined
  const code = (data as { resultCode?: unknown }).resultCode
  return typeof code === "string" && code !== "" ? code : undefined
}

function resumeError(code: string, message: string): BaseError {
  return {
    code: "PAYMENT_INTENT_AUTHENTICATION_FAILURE",
    resource: "payment_methods",
    message,
    meta: { error: code },
  }
}

export default useAdyenRedirectResume
