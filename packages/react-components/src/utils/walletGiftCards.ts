import { authorizeGiftCardSessions } from "@commercelayer/core-components"
import type { Order } from "@commercelayer/sdk"
import type { getOrderContext } from "#reducers/OrderReducer"
import type { BaseError } from "#typings/errors"

/**
 * Whether the order a wallet button holds may be missing gift cards it has
 * already charged. One per button, kept across attempts.
 */
export interface GiftCardReconciliation {
  pending: boolean
  /**
   * The order as last refetched here. The context catches up on its next
   * render, which a shopper retrying in the sheet need not wait for.
   */
  order?: Order
}

export type WalletGiftCardsResult =
  | { status: "charged" }
  /** A gift card was refused: `errors` for the outlet, `message` for the sheet. */
  | { status: "refused"; errors: BaseError[]; message: string }
  /** Nothing readable came back, or the order could not be brought up to date. */
  | { status: "failed"; code: string; message: string }

interface Params {
  accessToken: string
  interceptors?: Parameters<typeof authorizeGiftCardSessions>[0]["interceptors"]
  order: Order
  getOrder: getOrderContext
  reconciliation: GiftCardReconciliation
}

/**
 * Charge the order's gift cards from inside a wallet's sheet, which stays open
 * for another attempt after a refusal — so the next attempt must not run on an
 * order that predates this one.
 *
 * `authorizeGiftCardSessions` skips a session that already carries a live
 * authorization, but it reads that from the order it is handed. With two cards
 * where the first is charged and the second refused, the order held here still
 * shows the first as unpaid: retried as it is, the first card would be charged
 * again. So the order is refetched whenever anything may have been charged — a
 * card authorized, or an error nobody can read — and an attempt does not start
 * until that refetch has succeeded.
 */
export async function authorizeWalletGiftCards({
  accessToken,
  interceptors,
  order,
  getOrder,
  reconciliation,
}: Params): Promise<WalletGiftCardsResult> {
  const refetch = async (): Promise<Order | undefined> => {
    try {
      const fresh = await getOrder(order.id)
      if (fresh != null) {
        reconciliation.pending = false
        reconciliation.order = fresh
      }
      return fresh
    } catch {
      return undefined
    }
  }

  let current = newer(order, reconciliation.order)
  if (reconciliation.pending) {
    const fresh = await refetch()
    if (fresh == null) {
      return {
        status: "failed",
        code: "OrderNotReconciled",
        message: "The payment could not be started.",
      }
    }
    current = fresh
  }

  let authorized: Awaited<ReturnType<typeof authorizeGiftCardSessions>>
  try {
    authorized = await authorizeGiftCardSessions({ accessToken, interceptors, order: current })
  } catch {
    // Some cards may have been charged before it broke.
    reconciliation.pending = true
    await refetch()
    return {
      status: "failed",
      code: "GiftCardRefused",
      message: "The gift cards could not be charged.",
    }
  }

  // So the next attempt, and the place sequence once this has collected, skip
  // the cards this call charged — including when a later card was refused.
  if (authorized.authorizedSessionIds.length > 0) {
    reconciliation.pending = true
    await refetch()
  }

  if (authorized.errors.length > 0) {
    return {
      status: "refused",
      message: authorized.errors[0]?.message ?? "A gift card was refused.",
      errors: authorized.errors.map((error) => ({
        code: "VALIDATION_ERROR" as const,
        resource: "orders" as const,
        message: error.message,
        field: error.field,
        meta: { error: error.meta?.error ?? "GiftCardRefused" },
      })),
    }
  }
  return { status: "charged" }
}

/**
 * The more recent of the order the button holds and the one refetched here: the
 * refetched one until the context has caught up with it, and the context's
 * once anything has changed the order since.
 */
function newer(held: Order, refetched?: Order): Order {
  if (refetched == null || refetched.id !== held.id) return held
  const heldAt = Date.parse(held.updated_at ?? "")
  const refetchedAt = Date.parse(refetched.updated_at ?? "")
  if (Number.isNaN(heldAt) || Number.isNaN(refetchedAt)) return refetched
  return heldAt > refetchedAt ? held : refetched
}
