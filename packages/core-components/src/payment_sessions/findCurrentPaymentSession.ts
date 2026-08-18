import type { PaymentSession } from "@commercelayer/sdk"
import { TERMINAL_FAILURE_TRANSACTION_STATUSES } from "./types"

interface FindCurrentPaymentSessionParams {
  paymentSessions?: PaymentSession[] | null
  /**
   * Narrow to one Payment Setting. Omit to get the order's single current
   * selection across every setting, which is what a radio group needs.
   */
  paymentSettingId?: string
}

/**
 * Find the Payment Session the shopper's selection points at.
 *
 * The order has no `payment_setting` relationship, so a selection only exists
 * as a session — this is how the choice is read back, and why it survives a
 * reload. Browser state is a rendering cache of this, never the authority.
 *
 * Distinct from {@link findReusablePaymentSession}, which answers a narrower
 * question: "may I adopt this instead of creating one?". A session that has
 * already taken money still *is* the selection, but must not be reused.
 *
 * A session carrying a failed authorization is excluded: it is burnt, the
 * shopper has to try again, and showing it as the current selection would tell
 * them a payment is in place when none is.
 *
 * **The selection is single, and it is the most recent session.** Switching
 * setting leaves the previous session on the order — it is never deleted, both
 * because an inert `unpaid` session costs nothing and because a sales-channel
 * token can be refused the delete. Picking the newest is therefore what keeps
 * a radio group coherent: without it, every setting the shopper has ever tried
 * would read as selected at once.
 */
export function findCurrentPaymentSession({
  paymentSessions,
  paymentSettingId,
}: FindCurrentPaymentSessionParams): PaymentSession | undefined {
  const live = (paymentSessions ?? []).filter((session) => {
    if (paymentSettingId != null && session.payment_setting?.id !== paymentSettingId) return false
    const authorizationStatus = session.payment_authorization?.status
    if (authorizationStatus == null) return true
    return !TERMINAL_FAILURE_TRANSACTION_STATUSES.includes(
      authorizationStatus as (typeof TERMINAL_FAILURE_TRANSACTION_STATUSES)[number]
    )
  })

  // `created_at` is optional on the type, so fall back to array order rather
  // than dropping a session that came back without it.
  return live.reduce<PaymentSession | undefined>((newest, session) => {
    if (newest == null) return session
    const a = session.created_at == null ? 0 : Date.parse(session.created_at)
    const b = newest.created_at == null ? 0 : Date.parse(newest.created_at)
    return a >= b ? session : newest
  }, undefined)
}
