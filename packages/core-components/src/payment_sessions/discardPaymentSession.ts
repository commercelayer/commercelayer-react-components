import { getSdk } from "#sdk"
import type { RequestConfig } from "#types"

interface DiscardPaymentSessionParams extends Pick<RequestConfig, "accessToken" | "interceptors"> {
  paymentSessionId: string
}

/**
 * Delete a Payment Session that must not be used again, best effort.
 *
 * Used when a gateway refuses a payment. The Adyen Session survives a refusal
 * client-side — `adyen-web` rolls its `sessionData` forward and would happily
 * re-POST — but retrying on it is broken *server-side*: the refusal arrives as
 * an `AUTHORISATION` webhook that lands a `failed` Payment Authorization on the
 * session, and a later success then calls `succeed!` on a `failed` record. That
 * is not a legal transition, `whiny_transitions` is at its default, and the job
 * has `retry: 0` — so the retry's success would be dropped in silence.
 *
 * Deleting is chosen over waiting because the timing is not observable from
 * here: immediately after the refusal the failed authorization has not arrived
 * yet, so the session still reads as the current selection *and* as reusable.
 *
 * **Failures are swallowed, and the design still holds.** The API refuses to
 * delete a session with transactions attached (`dependent:
 * :restrict_with_exception`, surfaced as an unhandled 500), which is precisely
 * the case where the failed authorization has already landed — and a session in
 * that state is excluded by both `findCurrentPaymentSession` and
 * `findReusablePaymentSession` anyway. The two mechanisms cover the same hole
 * from opposite sides, so there is no outcome where a burnt session is adopted.
 *
 * @returns whether the session is known to be gone
 */
export async function discardPaymentSession({
  accessToken,
  interceptors,
  paymentSessionId,
}: DiscardPaymentSessionParams): Promise<boolean> {
  const sdk = getSdk({ accessToken, interceptors })
  try {
    await sdk.payment_sessions.delete(paymentSessionId)
    return true
  } catch {
    // See above: the authorization state excludes it regardless.
    return false
  }
}
