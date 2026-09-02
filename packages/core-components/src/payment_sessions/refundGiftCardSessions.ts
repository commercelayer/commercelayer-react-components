import type { PaymentSession } from "@commercelayer/sdk"
import { getSdk } from "#sdk"
import type { RequestConfig } from "#types"
import { mapPlaceabilityErrors } from "./mapPlaceabilityErrors"
import type { PlaceabilityError } from "./types"

/** Attempts spent waiting for the capture a refund has to point at. */
export const DEFAULT_REFUND_ATTEMPTS = 6
/** Delay between those attempts, in milliseconds. */
export const DEFAULT_REFUND_INTERVAL_MS = 500

/**
 * Includes needed to find the capture to refund, and to tell an already
 * refunded session from one still to do.
 */
const REFUND_INCLUDES = ["payment_sessions.payment_captures", "payment_sessions.payment_refunds"]

interface RefundGiftCardSessionsParams extends Pick<RequestConfig, "accessToken" | "interceptors"> {
  orderId: string
  /**
   * The sessions to give back — normally the `authorizedSessionIds` from the
   * `authorizeGiftCardSessions` call in the same attempt, never every charged
   * card on the order.
   */
  paymentSessionIds: string[]
  attempts?: number
  intervalMs?: number
}

export interface RefundGiftCardSessionsResult {
  refundedSessionIds: string[]
  /** Sessions still charged when this gave up, and why. */
  errors: PlaceabilityError[]
  /**
   * True when the captures never appeared. The gift cards are still charged and
   * the shopper's balance is still spent, so this must be surfaced rather than
   * treated as a completed rollback.
   */
  timedOut: boolean
}

/**
 * Give back gift cards charged for a payment that then failed.
 *
 * The case this exists for: the gift cards are authorized just before the
 * Drop-in is submitted, so a refused card leaves them charged on an order that
 * is not going to be placed. Authorizing a gift card debits the balance
 * immediately — the setting forces auto-capture, so the session lands on `paid`
 * — and a void always fails by construction, which leaves a refund as the only
 * way back.
 *
 * **The API grants exactly this and nothing more.** A sales-channel token may
 * create a `PaymentRefund` only for a session whose `payment_type` is
 * `GIFT_CARD`, and only while the order is in `pending` — `draft` is excluded
 * (`app/abilities/base_abilities/sales_channel_ability.rb`). A failed checkout
 * is precisely that situation, which is presumably why the grant is shaped this
 * way. Nothing else is refundable from a storefront.
 *
 * **Why it polls.** `payment_capture` is a required relationship on a refund,
 * and the capture is produced by the same background job that succeeds the
 * authorization — so immediately after `authorizeGiftCardSessions` returns
 * there is usually nothing to point at yet. Each attempt is one `GET`, and the
 * loop ends as soon as every session is handled.
 *
 * A session that already carries a refund is treated as done rather than
 * refunded twice; the balance was restored the first time.
 *
 * Failures are collected per session instead of stopping the loop: unlike
 * authorizing, where each step changes what the next may take, refunds are
 * independent, and giving up on the second card would leave the third charged
 * for no reason.
 */
export async function refundGiftCardSessions({
  accessToken,
  interceptors,
  orderId,
  paymentSessionIds,
  attempts = DEFAULT_REFUND_ATTEMPTS,
  intervalMs = DEFAULT_REFUND_INTERVAL_MS,
}: RefundGiftCardSessionsParams): Promise<RefundGiftCardSessionsResult> {
  if (paymentSessionIds.length === 0) {
    return { refundedSessionIds: [], errors: [], timedOut: false }
  }

  const sdk = getSdk({ accessToken, interceptors })
  const pending = new Set(paymentSessionIds)
  const refundedSessionIds: string[] = []
  const errors: PlaceabilityError[] = []

  for (let attempt = 1; attempt <= attempts && pending.size > 0; attempt++) {
    const order = await sdk.orders.retrieve(orderId, { include: REFUND_INCLUDES })
    const sessions = (order.payment_sessions ?? []).filter((session) => pending.has(session.id))

    for (const session of sessions) {
      // Already given back, by us on an earlier attempt or by someone else.
      if ((session.payment_refunds ?? []).length > 0) {
        pending.delete(session.id)
        continue
      }

      const capture = refundableCapture(session)
      // The job has not run yet. Leave it pending and look again.
      if (capture == null) continue

      try {
        await sdk.payment_refunds.create({
          payment_session: sdk.payment_sessions.relationship(session.id),
          payment_capture: sdk.payment_captures.relationship(capture),
          // Amount omitted on purpose: the server defaults it to the capture's
          // own refund balance, which is the number we would otherwise be
          // recomputing from values it gave us.
        })
        refundedSessionIds.push(session.id)
        pending.delete(session.id)
      } catch (error) {
        const mapped = mapPlaceabilityErrors(error)
        if (mapped.length === 0) throw error
        errors.push(...mapped)
        // Independent of the others — stop only on this one.
        pending.delete(session.id)
      }
    }

    if (pending.size > 0 && attempt < attempts) await sleep(intervalMs)
  }

  return { refundedSessionIds, errors, timedOut: pending.size > 0 }
}

/**
 * The capture a refund can be created against, if the job has produced one.
 *
 * A capture that is not yet `succeeded` is skipped rather than rejected — the
 * same background job that succeeds the authorization creates and succeeds it,
 * so "not there yet" and "not succeeded yet" are the same wait, and the next
 * attempt will find it.
 *
 * `refund_balance_cents` is only trusted when present: an order fetched with a
 * `fields` allowlist that omits it must not lose the refund altogether, and the
 * server rejects an over-refund on its own.
 */
function refundableCapture(session: PaymentSession): string | undefined {
  return (session.payment_captures ?? []).find((capture) => {
    if (capture.status !== "succeeded") return false
    const balance = capture.refund_balance_cents
    return balance == null || balance > 0
  })?.id
}

async function sleep(ms: number): Promise<void> {
  if (ms <= 0) return
  await new Promise<void>((resolve) => setTimeout(resolve, ms))
}
