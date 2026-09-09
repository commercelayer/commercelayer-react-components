import type { Order, PaymentSession } from "@commercelayer/sdk"
import { getSdk } from "#sdk"
import type { RequestConfig } from "#types"
import { derivePaymentSessionsState } from "./derivePaymentSessionsState"
import { invalidateCurrentPaymentSession } from "./invalidateCurrentPaymentSession"

interface ApplyGiftCardParams extends Pick<RequestConfig, "accessToken" | "interceptors"> {
  /** The order as last fetched. Its sessions decide the amount to ask for. */
  order: Order
  giftCardCode: string
}

/**
 * Spend a gift card on an order by creating a Payment Session for it.
 *
 * **Why an explicit `amount_cents` from the second card onwards.** The server
 * sizes a gift card session as `min(order.session_amount_cents, balance)`, and
 * `session_amount_cents` only drops once a session is *authorized*. Gift cards
 * are authorized at place time, so while the shopper is still choosing the
 * server sees the full total: a second card would be sized for the whole order
 * rather than the difference. On a $71 order, a $50 card followed by a $100 card
 * would produce sessions of $50 and $71 — $121 of credit for a $71 order, with
 * nothing server-side to stop it.
 *
 * Sending an amount is safe because `cap_amount_cents` clamps it *down* to what
 * the server would have allowed and never up, so the server stays the authority
 * on the maximum. And the number sent is a sum of amounts the server itself
 * computed for the earlier sessions — not a reimplementation of its rules.
 *
 * This is the one place the "never send `amount_cents`" rule is broken. It still
 * holds for the session paying the difference, where the server must be the one
 * to work out what is left.
 *
 * Applying a gift card also **invalidates the session paying the difference**:
 * its `amount_cents` is immutable, so the moment the remainder changes that
 * session is dead. Both happen here, as one operation, because binding the
 * invalidation to the action that causes it is what makes it deterministic —
 * rather than an effect somewhere comparing amounts.
 */
export async function applyGiftCard({
  accessToken,
  interceptors,
  order,
  giftCardCode,
}: ApplyGiftCardParams): Promise<PaymentSession> {
  const sdk = getSdk({ accessToken, interceptors })
  const state = derivePaymentSessionsState(order)

  if (state.giftCardSettingId == null) {
    throw new Error("This order has no gift card payment setting available.")
  }

  const session = await sdk.payment_sessions.create({
    gift_card_code: giftCardCode,
    payment_setting: sdk.payment_settings.relationship(state.giftCardSettingId),
    order: sdk.orders.relationship(order.id),
    // Omitted for the first card so the server sizes it against the balance;
    // supplied afterwards because the server's own remainder has not moved.
    ...(state.giftCardSessions.length > 0 ? { amount_cents: state.remainingAmountCents } : {}),
  })

  await invalidateCurrentPaymentSession({ accessToken, interceptors, order })

  return session
}
