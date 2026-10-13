import { getSdk } from "#sdk"
import type { RequestConfig } from "#types"
import { extractApiErrors } from "./apiErrors"
import { TERMINAL_FAILURE_TRANSACTION_STATUSES } from "./types"

/** Polls of the authorization before its outcome is reported as unknown. */
export const DEFAULT_BRAINTREE_AUTHORIZATION_ATTEMPTS = 30
/** Delay between polls of the authorization, in milliseconds. */
export const DEFAULT_BRAINTREE_AUTHORIZATION_INTERVAL_MS = 1000

/**
 * Authorization states in which Braintree has taken the money.
 *
 * `processing` as well as `succeeded`: with `auto_capture` on, Commerce Layer
 * charges rather than authorizes, and Braintree's `SUBMITTED_FOR_SETTLEMENT`
 * maps to `processing` (`Payment::Session::Braintree::ACTION_STATES` in
 * `core-api`). The money is gone either way; settlement is the webhook's
 * business, not the shopper's.
 */
const MONEY_TAKEN_STATUSES = ["succeeded", "processing"] as const

interface AuthorizeBraintreePaymentSessionParams
  extends Pick<RequestConfig, "accessToken" | "interceptors"> {
  paymentSessionId: string
  /**
   * The payment method nonce `braintree-web` returned — after 3DS, the one
   * `verifyCard` handed back, not the one it was given. Single use.
   */
  nonce: string
  /** Polls of the authorization before giving up. */
  attempts?: number
  /** Delay between polls, in milliseconds. */
  intervalMs?: number
}

/**
 * How a Braintree authorization ended, in the terms that decide what the caller
 * may do next.
 *
 * - `authorized` — the money is taken.
 * - `refused` — a verdict: nothing was taken, so undoing what led up to it is
 *   safe. `code` is the authorization's status (`declined`, `failed`, …) or the
 *   API's own error code when the authorization was never created.
 * - `unknown` — the payment may or may not have gone through, and nothing may
 *   be undone. `code` says which wait ran out or which call broke.
 */
export type AuthorizeBraintreePaymentSessionResult =
  | { status: "authorized" }
  | { status: "refused"; code: string }
  | { status: "unknown"; code: string }

/**
 * Hand a Braintree nonce to Commerce Layer and wait for Braintree's answer.
 *
 * Three calls, because Braintree is the one card gateway whose charge happens
 * server-side: the browser only tokenizes the card (and authenticates it with
 * 3DS), and the money moves when Commerce Layer relays the nonce to Braintree's
 * `authorizePaymentMethod` — or `chargePaymentMethod`, with `auto_capture`.
 *
 * 1. `PATCH client_data.payment_method_id` on the session. The only place the
 *    nonce is read from (`Payment::Payload::Braintree#payment_method_id`), and
 *    storing it calls nobody.
 * 2. `POST` a Payment Authorization. Commerce Layer answers `pending` at once
 *    and runs the gateway call in a background job.
 * 3. Poll it until it leaves `pending`. Usually one or two seconds.
 *
 * The decline reason is not available to the caller, and not for want of
 * looking: Braintree's answer lands in the authorization's `response_data`,
 * which is withheld from sales-channel and customer tokens. The status is all
 * there is.
 *
 * Note what it does **not** do: check the 3DS outcome. Commerce Layer sends no
 * 3DS parameter and makes no liability-shift check of its own — a nonce is
 * authorized on its own merits — so that decision belongs to whoever ran
 * `verifyCard`, before calling this.
 */
export async function authorizeBraintreePaymentSession({
  accessToken,
  interceptors,
  paymentSessionId,
  nonce,
  attempts = DEFAULT_BRAINTREE_AUTHORIZATION_ATTEMPTS,
  intervalMs = DEFAULT_BRAINTREE_AUTHORIZATION_INTERVAL_MS,
}: AuthorizeBraintreePaymentSessionParams): Promise<AuthorizeBraintreePaymentSessionResult> {
  const sdk = getSdk({ accessToken, interceptors })

  // Storing the nonce moves no money, so any failure here is a verdict: there
  // is nothing a retry of the same call could have charged.
  try {
    await sdk.payment_sessions.update({
      id: paymentSessionId,
      client_data: { payment_method_id: nonce },
    })
  } catch (error) {
    return { status: "refused", code: apiErrorCode(error) ?? "payment_method_not_stored" }
  }

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
    // `pending`, and anything this code does not know: Braintree never asks
    // for an action here, because 3DS ran in the browser before the nonce was
    // sent. Waiting is the only thing left to do.
  }

  // Still pending. Commerce Layer leaves an authorization there for good when
  // the gateway call raised instead of answering, so this is not latency we
  // can outwait — but it is not a refusal either.
  return { status: "unknown", code: "authorization_pending" }
}

/** The API's own code for a refused call, when the error is one. */
function apiErrorCode(error: unknown): string | undefined {
  const [first] = extractApiErrors(error)
  if (first == null) return undefined
  return first.meta?.error ?? first.code ?? "VALIDATION_ERROR"
}

async function sleep(ms: number): Promise<void> {
  if (ms <= 0) return
  await new Promise<void>((resolve) => setTimeout(resolve, ms))
}
