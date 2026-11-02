import { getSdk } from "#sdk"
import type { RequestConfig } from "#types"
import {
  type AuthorizePaymentSessionResult,
  apiErrorCode,
  authorizePaymentSession,
  DEFAULT_AUTHORIZATION_ATTEMPTS,
  DEFAULT_AUTHORIZATION_INTERVAL_MS,
} from "./authorizePaymentSession"

/** Polls of the authorization before its outcome is reported as unknown. */
export const DEFAULT_BRAINTREE_AUTHORIZATION_ATTEMPTS = DEFAULT_AUTHORIZATION_ATTEMPTS
/** Delay between polls of the authorization, in milliseconds. */
export const DEFAULT_BRAINTREE_AUTHORIZATION_INTERVAL_MS = DEFAULT_AUTHORIZATION_INTERVAL_MS

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

/** How a Braintree authorization ended: see `AuthorizePaymentSessionResult`. */
export type AuthorizeBraintreePaymentSessionResult = AuthorizePaymentSessionResult

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

  return await authorizePaymentSession({
    accessToken,
    interceptors,
    paymentSessionId,
    attempts,
    intervalMs,
  })
}
