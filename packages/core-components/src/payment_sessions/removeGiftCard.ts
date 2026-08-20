import type { Order } from "@commercelayer/sdk"
import { getSdk } from "#sdk"
import type { RequestConfig } from "#types"
import { invalidateCurrentPaymentSession } from "./invalidateCurrentPaymentSession"
import { hasLiveAuthorization } from "./types"

interface RemoveGiftCardParams extends Pick<RequestConfig, "accessToken" | "interceptors"> {
  order: Order
  /** Id of the gift card Payment Session to remove. */
  paymentSessionId: string
}

/**
 * Take a gift card back off an order by deleting its Payment Session.
 *
 * Only possible while the card has not been charged. Authorizing a gift card
 * debits the balance immediately — the setting forces auto-capture, so the
 * session goes straight to `paid` — and from there only a refund could return
 * it, which this iteration does not implement. The API would refuse the delete
 * anyway, with an unhandled 500, and a sales-channel token cannot delete the
 * authorization to clear the way.
 *
 * Deleting an unauthorized session touches no balance: nothing was taken, so
 * there is nothing to give back.
 *
 * Removing a gift card raises the remainder, which **invalidates the session
 * paying the difference** for the same reason applying one does — its amount is
 * immutable and now too small.
 */
export async function removeGiftCard({
  accessToken,
  interceptors,
  order,
  paymentSessionId,
}: RemoveGiftCardParams): Promise<void> {
  const session = (order.payment_sessions ?? []).find(
    (candidate) => candidate.id === paymentSessionId
  )

  if (session != null && hasLiveAuthorization(session)) {
    throw new Error(
      "This gift card has already been charged and can no longer be removed from the order."
    )
  }

  const sdk = getSdk({ accessToken, interceptors })
  await sdk.payment_sessions.delete(paymentSessionId)

  await invalidateCurrentPaymentSession({ accessToken, interceptors, order })
}
