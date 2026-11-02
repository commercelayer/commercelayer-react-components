import { getSdk } from "#sdk"
import type { RequestConfig } from "#types"
import { extractApiErrors } from "./apiErrors"
import { TERMINAL_FAILURE_TRANSACTION_STATUSES } from "./types"

/** Polls of the authorization before its outcome is reported as unknown. */
export const DEFAULT_AUTHORIZATION_ATTEMPTS = 30
/** Delay between polls of the authorization, in milliseconds. */
export const DEFAULT_AUTHORIZATION_INTERVAL_MS = 1000

/**
 * Authorization states in which the gateway has taken the money.
 *
 * `processing` as well as `succeeded`: with `auto_capture` on, Commerce Layer
 * charges rather than authorizes, and a charge the gateway has accepted but not
 * yet settled reads as `processing`. The money is gone either way; settlement is
 * the webhook's business, not the shopper's.
 */
const MONEY_TAKEN_STATUSES = ["succeeded", "processing"] as const

interface AuthorizePaymentSessionParams
  extends Pick<RequestConfig, "accessToken" | "interceptors"> {
  paymentSessionId: string
  /** Polls of the authorization before giving up. */
  attempts?: number
  /** Delay between polls, in milliseconds. */
  intervalMs?: number
}

/**
 * How an authorization ended, in the terms that decide what the caller may do
 * next.
 *
 * - `authorized` — the money is taken.
 * - `refused` — a verdict: nothing was taken, so undoing what led up to it is
 *   safe. `code` is the authorization's status (`declined`, `failed`, …) or the
 *   API's own error code when the authorization was never created.
 * - `unknown` — the payment may or may not have gone through, and nothing may
 *   be undone. `code` says which wait ran out or which call broke.
 */
export type AuthorizePaymentSessionResult =
  | { status: "authorized" }
  | { status: "refused"; code: string }
  | { status: "unknown"; code: string }

/**
 * Create the Payment Authorization for a session whose payment the browser has
 * already collected, and wait for the gateway's answer.
 *
 * For gateways whose charge happens server-side, once the shopper is done:
 * Braintree, once the nonce is on the session; PayPal, once the shopper has
 * approved the PayPal order in PayPal's window. Commerce Layer answers
 * `pending` at once and makes the gateway call in a background job, so the
 * authorization is polled until it leaves `pending` — usually a second or two.
 *
 * The decline reason is not available to the caller: the gateway's answer lands
 * in the authorization's `response_data`, which is withheld from sales-channel
 * and customer tokens. The status is all there is.
 */
export async function authorizePaymentSession({
  accessToken,
  interceptors,
  paymentSessionId,
  attempts = DEFAULT_AUTHORIZATION_ATTEMPTS,
  intervalMs = DEFAULT_AUTHORIZATION_INTERVAL_MS,
}: AuthorizePaymentSessionParams): Promise<AuthorizePaymentSessionResult> {
  const sdk = getSdk({ accessToken, interceptors })

  let authorizationId: string
  try {
    const created = await sdk.payment_authorizations.create({
      payment_session: sdk.payment_sessions.relationship(paymentSessionId),
    })
    authorizationId = created.id
  } catch (error) {
    // The API refused the authorization outright — an expired session, one
    // already authorized — so it was never created and nothing was charged.
    // Anything without an API error body is a transport failure, and then the
    // authorization may well exist: the job would run whether or not the
    // response reached us.
    const code = apiErrorCode(error)
    return code != null ? { status: "refused", code } : { status: "unknown", code: "network_error" }
  }

  for (let attempt = 1; attempt <= attempts; attempt++) {
    await sleep(intervalMs)
    let status: string | undefined
    try {
      status = (await sdk.payment_authorizations.retrieve(authorizationId)).status
    } catch {
      // A failed read says nothing about the payment. Keep waiting.
      continue
    }
    if (MONEY_TAKEN_STATUSES.includes(status as (typeof MONEY_TAKEN_STATUSES)[number])) {
      return { status: "authorized" }
    }
    if (
      TERMINAL_FAILURE_TRANSACTION_STATUSES.includes(
        status as (typeof TERMINAL_FAILURE_TRANSACTION_STATUSES)[number]
      )
    ) {
      return { status: "refused", code: status }
    }
    // `pending`, and anything this code does not know: the shopper has done
    // their part before this is called, so there is no action left to ask for.
    // Waiting is the only thing left to do.
  }

  // Still pending. An authorization whose gateway call raised instead of
  // answering is left there for good, so this is not latency we can outwait —
  // but it is not a refusal either.
  return { status: "unknown", code: "authorization_pending" }
}

/** The API's own code for a refused call, when the error is one. */
export function apiErrorCode(error: unknown): string | undefined {
  const [first] = extractApiErrors(error)
  if (first == null) return undefined
  return first.meta?.error ?? first.code ?? "VALIDATION_ERROR"
}

async function sleep(ms: number): Promise<void> {
  if (ms <= 0) return
  await new Promise<void>((resolve) => setTimeout(resolve, ms))
}
