import type { Order } from "@commercelayer/sdk"
import { getSdk } from "#sdk"
import type { RequestConfig } from "#types"
import { derivePaymentSessionsState } from "./derivePaymentSessionsState"
import { mapPlaceabilityErrors } from "./mapPlaceabilityErrors"
import { hasLiveAuthorization, type PlaceabilityError } from "./types"

interface AuthorizeGiftCardSessionsParams
  extends Pick<RequestConfig, "accessToken" | "interceptors"> {
  /** The order as last fetched, with `payment_sessions.payment_authorization`. */
  order: Order
}

export interface AuthorizeGiftCardSessionsResult {
  /**
   * Ids of the sessions **this call** authorized — not every charged gift card
   * on the order.
   *
   * The distinction is what makes a rollback safe: a card charged by an earlier
   * timed-out attempt is not ours to refund, and refunding it would take back
   * money for a payment that may yet complete.
   */
  authorizedSessionIds: string[]
  /** Why it stopped, if it did. */
  errors: PlaceabilityError[]
}

/**
 * Authorize an order's applied gift cards, ahead of the gateway.
 *
 * `placeOrderWithPaymentSessions` already does this as its first step, and for
 * settings with no gateway UI that is the right place. A card is different: the
 * money leaves when the shopper submits the Drop-in, which happens *before* the
 * place sequence runs — so leaving the gift cards to that sequence would charge
 * them after the card, inverting the order
 * `2026-08-20-gift-cards-as-payment-sessions.md` established.
 *
 * Calling this first restores it, and costs nothing downstream:
 * `placeOrderWithPaymentSessions` skips any session that already carries a live
 * authorization. **The caller must refetch the order in between** — that skip
 * reads the order it was handed, so a stale copy would authorize the same cards
 * twice and take the money twice.
 *
 * Sequential and stopping at the first failure, for the same reason the place
 * sequence is: each authorization shrinks what the next session may take, and
 * carrying on would charge more cards for an order that is not going to be
 * placed.
 *
 * Nothing is rolled back here. Whether the cards already charged should be
 * refunded depends on what the *gateway* then does, which this function cannot
 * see — see `refundGiftCardSessions`.
 */
export async function authorizeGiftCardSessions({
  accessToken,
  interceptors,
  order,
}: AuthorizeGiftCardSessionsParams): Promise<AuthorizeGiftCardSessionsResult> {
  const sdk = getSdk({ accessToken, interceptors })
  const { giftCardSessions } = derivePaymentSessionsState(order)
  const authorizedSessionIds: string[] = []

  for (const session of giftCardSessions) {
    // Already taken, or in flight. Creating a second authorization over the
    // first is how the money gets taken twice.
    if (hasLiveAuthorization(session)) continue

    try {
      await sdk.payment_authorizations.create({
        payment_session: sdk.payment_sessions.relationship(session.id),
      })
      authorizedSessionIds.push(session.id)
    } catch (error) {
      const errors = mapPlaceabilityErrors(error)
      // Not a refusal we can read, so not something the caller can report as
      // one. Let it out rather than flatten it into an empty error list.
      if (errors.length === 0) throw error
      return { authorizedSessionIds, errors }
    }
  }

  return { authorizedSessionIds, errors: [] }
}
