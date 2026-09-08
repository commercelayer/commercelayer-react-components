import type { PaymentSession } from "@commercelayer/sdk"
import { findCurrentPaymentSession } from "./findCurrentPaymentSession"
import { TERMINAL_FAILURE_TRANSACTION_STATUSES } from "./types"

interface FindReusablePaymentSessionParams {
  /** The order's sessions, from `order.payment_sessions`. */
  paymentSessions?: PaymentSession[] | null
  /** The Payment Setting the shopper selected. */
  paymentSettingId: string
  /**
   * What the session would have to pay, from `derivePaymentSessionsState`. When
   * given, a session sized for a different remainder is not adopted. Omit it
   * only where the remainder is unknown.
   */
  amountCents?: number
  /** Injectable for tests. Defaults to now. */
  now?: Date
}

/**
 * Find a Payment Session the library may adopt instead of creating a new one.
 *
 * A session qualifies when it belongs to the selected Payment Setting, has not
 * taken any money yet, has not expired, and is not carrying a failed
 * authorization.
 *
 * Reuse is not an optimisation — it is what makes selection survive a reload
 * and what stops a remount from creating a second session. `amount_cents` is
 * immutable once a session exists, so "update the existing one" is not an
 * option the API offers.
 *
 * Sessions are always searched for, never read positionally: failed attempts
 * leave inert `unpaid` sessions behind, and a gift card (or, later, a split
 * payment) puts other settings' sessions in the same array.
 *
 * A session sized for a different remainder is not reusable either. Applying a
 * gift card is supposed to delete it (`invalidateCurrentPaymentSession`), but
 * that deletion is best effort and swallows its failures — so the amount is
 * checked here as well, where adopting the wrong one would authorize more than
 * is owed.
 */
export function findReusablePaymentSession({
  paymentSessions,
  paymentSettingId,
  amountCents,
  now = new Date(),
}: FindReusablePaymentSessionParams): PaymentSession | undefined {
  // Only the session that **is** the current selection may be adopted.
  //
  // Not a narrowing for tidiness: adopting any other one is unobservable, and
  // therefore a bug. The selection is defined as the newest non-gift-card
  // session (see `findCurrentPaymentSession`), and adopting changes no
  // timestamp — so reusing an older session leaves the radio group pointing
  // where it already pointed, the click does nothing, and clicking again does
  // nothing again. A shopper who picks Adyen, switches to bank transfer, then
  // changes their mind can never get back: their first Adyen session is still
  // adoptable, so no new one is created, so Adyen never becomes the newest.
  //
  // Both reasons reuse exists for are cases where the candidate *is* the
  // selection — a remount and a page reload — so nothing is lost by requiring
  // it, and switching back now creates a session that can actually be selected.
  const candidate = findCurrentPaymentSession({ paymentSessions })
  if (candidate == null) return undefined

  return [candidate].find((session) => {
    if (session.payment_setting?.id !== paymentSettingId) return false

    // Only when both numbers are known: an order fetched without
    // `amount_cents` in its `fields` must not lose reuse altogether.
    if (amountCents != null && session.amount_cents != null && session.amount_cents !== amountCents)
      return false

    // Anything past `unpaid` has taken money (or has been voided/refunded);
    // in both cases creating or adopting it again would be wrong.
    if (session.status !== "unpaid") return false

    if (session.expires_at != null && new Date(session.expires_at) <= now) return false

    // A session whose authorization failed stays `unpaid` forever — the
    // session only advances on a *succeeded* authorization — so status alone
    // cannot tell a fresh session from a burnt one.
    const authorizationStatus = session.payment_authorization?.status
    if (
      authorizationStatus != null &&
      TERMINAL_FAILURE_TRANSACTION_STATUSES.includes(
        authorizationStatus as (typeof TERMINAL_FAILURE_TRANSACTION_STATUSES)[number]
      )
    ) {
      return false
    }

    return true
  })
}
