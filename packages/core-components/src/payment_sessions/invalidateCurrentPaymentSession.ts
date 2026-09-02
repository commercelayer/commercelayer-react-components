import type { Order } from "@commercelayer/sdk"
import { getSdk } from "#sdk"
import type { RequestConfig } from "#types"
import { findCurrentPaymentSession } from "./findCurrentPaymentSession"
import { hasLiveAuthorization } from "./types"

interface InvalidateCurrentPaymentSessionParams
  extends Pick<RequestConfig, "accessToken" | "interceptors"> {
  order: Order
}

/**
 * Delete the session paying the difference, because the difference changed.
 *
 * `amount_cents` is set once and never updatable, so a session created against
 * an older remainder is not merely stale — it is wrong. Left in place it would
 * still read as the shopper's current selection (it is `unpaid` and unburnt),
 * and at place time we would authorize an amount larger than what is owed.
 *
 * Only sessions that have taken nothing are deleted. One carrying a live
 * authorization is left alone: the API refuses to delete a session with
 * transactions attached — and surfaces that refusal as an unhandled 500 — and a
 * sales-channel token cannot delete the authorization either. Money already
 * taken is not ours to undo here.
 *
 * Failures are swallowed. This runs alongside a gift card operation the shopper
 * asked for and can see the result of; turning a cleanup failure into a visible
 * error would report the wrong thing. The stale session stays out of the
 * selection anyway, because the amount check that follows it is server-side.
 */
export async function invalidateCurrentPaymentSession({
  accessToken,
  interceptors,
  order,
}: InvalidateCurrentPaymentSessionParams): Promise<void> {
  const current = findCurrentPaymentSession({ paymentSessions: order.payment_sessions })
  if (current == null || hasLiveAuthorization(current)) return

  const sdk = getSdk({ accessToken, interceptors })
  try {
    await sdk.payment_sessions.delete(current.id)
  } catch {
    // Best effort — see above.
  }
}
