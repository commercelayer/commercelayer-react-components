import type { Order, PaymentSession } from "@commercelayer/sdk"
import { findCurrentPaymentSession } from "./findCurrentPaymentSession"
import {
  GIFT_CARD_SETTING_TYPE,
  hasLiveAuthorization,
  hasReturnedMoney,
  holdsMoney,
  isGiftCardSession,
} from "./types"

export interface PaymentSessionsState {
  /**
   * Gift cards the shopper has applied and can still see, newest last. Excludes
   * any whose authorization failed or that have been refunded: those took no
   * money and showing them would tell the shopper a payment is in place when
   * none is.
   */
  giftCardSessions: PaymentSession[]
  /** Sum of the applied gift cards, at face value. */
  giftCardAmountCents: number
  /**
   * What the shopper still has to pay.
   *
   * Derived here rather than read from `order.session_amount_cents`, which does
   * not move until a session is authorized — and gift cards are authorized at
   * place time, so the server's number stays at the full total for the whole
   * time the shopper is choosing. The amounts summed are the ones the server
   * computed for each session, so this is arithmetic over server values, not a
   * reimplementation of its rules.
   */
  remainingAmountCents: number
  /**
   * True when the order had something to pay and it is now all covered.
   *
   * False when the total is unknown or zero: an order fetched without
   * `total_amount_with_taxes_cents` must not read as paid for.
   */
  isCovered: boolean
  /**
   * Whether another gift card may be applied.
   *
   * False once anything has been authorized: money is taken or in flight, and
   * settling a partially-paid order is a flow this iteration does not
   * implement.
   */
  canAddGiftCard: boolean
  /** The non-gift-card session paying the difference, if the shopper picked one. */
  currentPaymentSession?: PaymentSession
  /** The gift card Payment Setting, when the order has one available. */
  giftCardSettingId?: string
}

/**
 * Everything the payment UI needs to know about an order's Payment Sessions,
 * in one place.
 *
 * One source deliberately: the remaining amount drives the order total, whether
 * the method selector renders at all, whether the gift card input accepts
 * another code, and whether a consuming application still considers payment
 * required. Deriving it in more than one place is how those four end up
 * disagreeing.
 */
export function derivePaymentSessionsState(order?: Order | null): PaymentSessionsState {
  const sessions = order?.payment_sessions ?? []
  const total = order?.total_amount_with_taxes_cents ?? 0

  const giftCardSessions = sessions.filter(
    (session) => isGiftCardSession(session) && isLiveGiftCard(session)
  )
  const giftCardAmountCents = sumAmounts(giftCardSessions)

  // A method session reduces what is left only once it has taken money — an
  // unauthorized one is just an intent, and one that has given the money back
  // is history. Gift cards count as soon as applied, which is the whole reason
  // this derivation exists.
  const takenMethodAmountCents = sumAmounts(
    sessions.filter((session) => !isGiftCardSession(session) && holdsMoney(session))
  )

  const remainingAmountCents = Math.max(0, total - giftCardAmountCents - takenMethodAmountCents)

  // `total > 0` guards against reading "nothing left to pay" out of a total we
  // do not have. An order fetched without `total_amount_with_taxes_cents` in
  // its `fields` looks free, and a bare `remainingAmountCents === 0` would then
  // hide the whole payment step. A genuinely free order needs no payment either,
  // but that is decided from the total itself, not from coverage.
  const isCovered = total > 0 && remainingAmountCents === 0

  return {
    giftCardSessions,
    giftCardAmountCents,
    remainingAmountCents,
    isCovered,
    // Nothing more may be applied once money has been taken: settling a
    // partially-paid order is a flow this iteration does not implement.
    //
    // `holdsMoney` and not `hasLiveAuthorization`: a refunded session keeps its
    // `succeeded` authorization, so the narrower test left this false for good
    // once any card had been charged and given back — and the gift card input,
    // which renders on this, never came back for the shopper who needed it most.
    canAddGiftCard: remainingAmountCents > 0 && !sessions.some(holdsMoney),
    currentPaymentSession: findCurrentPaymentSession({ paymentSessions: sessions }),
    giftCardSettingId: (order?.available_payment_settings ?? []).find(
      (setting) => setting.type === GIFT_CARD_SETTING_TYPE
    )?.id,
  }
}

/**
 * A gift card session still worth showing: nothing failed and nothing was given
 * back. A refunded one is history, not an applied card.
 *
 * The "given back" half is read from the session's `status`, **not** from
 * `payment_refunds`. That relationship needs
 * `payment_sessions.payment_refunds` in the order's `include` and nothing
 * registers it — so a check on the array never fires, and a card whose money
 * had been returned would go on being listed and on being deducted from the
 * remainder. The order would then show a coverage it does not have, size a new
 * session against the wrong amount, and keep the place-order button live on the
 * strength of it.
 *
 * A refund that is still `pending` deliberately leaves the card listed: the
 * money has not moved yet, and the session only reaches `refunded` when it has.
 * Hiding it earlier would raise the remainder while the balance is still spent.
 */
function isLiveGiftCard(session: PaymentSession): boolean {
  if (hasReturnedMoney(session)) return false
  const status = session.payment_authorization?.status
  if (status == null) return true
  return hasLiveAuthorization(session)
}

// `holdsMoney` is the pair of these two asked together; see its note in
// `types.ts` for why asking only the first is a bug and not a shortcut.

function sumAmounts(sessions: PaymentSession[]): number {
  return sessions.reduce((total, session) => total + (session.amount_cents ?? 0), 0)
}
