import type { Order, PaymentSession } from "@commercelayer/sdk"
import { hasLiveAuthorization } from "./types"

/**
 * How an applied gift card can be taken back off an order.
 *
 * Two different domain operations behind one gesture, and the difference is
 * worth exposing: an application wants to word them differently, may want to
 * confirm the second, and has to explain that the second is slow.
 */
export type GiftCardRemoval =
  /** Nothing was charged: the Payment Session is deleted and no balance moves. */
  | "discard"
  /**
   * The card was charged, so the only way back is a `PaymentRefund`. Slower — a
   * background job, then a poll — and a real accounting record: it restores the
   * balance and leaves an entry in the card's usage log.
   */
  | "refund"

interface GiftCardRemovalParams {
  /** The gift card Payment Session in question. */
  paymentSession: PaymentSession
  /** The order it belongs to. Its status decides whether a refund is permitted. */
  order?: Order | null
  /** True when the subtree is a recap rather than a form. */
  readonly?: boolean
}

/**
 * Decide how — or whether — a gift card can come off the order.
 *
 * `undefined` means it cannot, and the control must not be rendered rather than
 * rendered and failing. There are three ways to get there, and only one of them
 * is permanent:
 *
 * - **The subtree is readonly.** A recap, not a form.
 * - **The order has left `pending`.** A storefront token's refund grant names
 *   that status exactly — `payment_type: 'GIFT_CARD'` *and* `order: { status:
 *   'pending' }` — so on a placed order there is no refund to offer at all.
 *   This is the painful case: a place that timed out with the cards already
 *   charged is exactly when a shopper most wants the money back, and a
 *   storefront cannot give it to them.
 * - **The charge is still settling.** Between the authorization being created
 *   and the background job capturing it, neither route is open: the API refuses
 *   to delete a session with transactions attached (an unhandled 500), and a
 *   refund has no capture to point at yet. It lasts seconds and resolves on its
 *   own, which is why it reads the same as "cannot" rather than getting a state
 *   of its own — a control that appears, fails, and then works would be worse
 *   than one that appears a moment late.
 *
 * Requiring a captured state rather than merely a live authorization is what
 * makes the refund path reliable: for gift cards the setting forces
 * auto-capture, so `paid` is reached *through* the capture — by the time this
 * returns `"refund"`, the record a refund needs already exists.
 */
export function giftCardRemoval({
  paymentSession,
  order,
  readonly,
}: GiftCardRemovalParams): GiftCardRemoval | undefined {
  if (readonly === true) return undefined

  // Nothing taken, so the session is inert and deleting it touches no balance.
  if (!hasLiveAuthorization(paymentSession)) return "discard"

  if (order?.status !== "pending") return undefined

  // Captured, so there is something to refund against. `authorized` is skipped
  // deliberately: it is the transient step before auto-capture lands.
  if (paymentSession.status !== "paid" && paymentSession.status !== "partially_paid") {
    return undefined
  }

  return "refund"
}
