import type { Order, PaymentSession } from "@commercelayer/sdk"
import { getSdk } from "#sdk"
import type { RequestConfig } from "#types"
import { derivePaymentSessionsState } from "./derivePaymentSessionsState"
import { mapPlaceabilityErrors } from "./mapPlaceabilityErrors"
import { hasLiveAuthorization, type PlaceabilityError } from "./types"

/** Attempts before the placeability check gives up. */
export const DEFAULT_PLACEABLE_ATTEMPTS = 5
/** Delay between placeability attempts, in milliseconds. */
export const DEFAULT_PLACEABLE_INTERVAL_MS = 1000

interface PlaceOrderWithPaymentSessionsParams
  extends Pick<RequestConfig, "accessToken" | "interceptors"> {
  /**
   * The order as last fetched, with `payment_sessions.payment_setting` and
   * `payment_sessions.payment_authorization` included. Its sessions are what
   * gets authorized, and in which order.
   */
  order: Order
  /** Placeability attempts before giving up. Defaults to 5. */
  attempts?: number
  /** Delay between attempts, in milliseconds. Defaults to 1000. */
  intervalMs?: number
}

export interface PlaceOrderWithPaymentSessionsResult {
  /** True when the order is placed — whether by us or by `auto_place`. */
  placed: boolean
  /** The order as the API last returned it. */
  order?: Order
  /** Reasons the order could not be placed, or why an authorization failed. */
  errors: PlaceabilityError[]
  /**
   * True when the placeability attempts ran out. The payment may still succeed
   * later, so this must never be reported as a payment failure.
   */
  timedOut: boolean
}

/**
 * Take payment for an order on the `payment_sessions` model and place it.
 *
 * The sequence is: authorize the gift cards, then authorize the session paying
 * the difference, then poll `_placeable`, then `_place`.
 *
 * **Why gift cards first.** Nothing server-side enforces the order — it is a
 * client-side safety property. Each authorization shrinks what the next session
 * is allowed to take, and a gift card that is charged after a failed method
 * payment would leave the shopper's balance spent on an order that never got
 * placed.
 *
 * **Why the difference may be absent.** Gift cards can cover the order
 * entirely, in which case there is no other session at all and this goes
 * straight from the gift cards to the placeability check.
 *
 * **Why the authorizations are created here and not at selection.** An
 * authorization is the record proving money was taken. Creating it when the
 * shopper picks a radio button, or types a gift card code, would take their
 * money on selection and make changing their mind a refund. Creating it here
 * keeps both reversible: a gift card can be removed for free right up to this
 * point.
 *
 * **Why `_placeable` is retried instead of reported.** Authorizing is
 * asynchronous — it runs in a background job — so the first check legitimately
 * fails with "the payment doesn't cover the required percentage" while the
 * money is still being taken. Reporting that straight away would tell the
 * shopper their payment failed a second before it succeeded. Only an error that
 * survives the last attempt is real. A failed `_placeable` persists nothing, so
 * retrying is side-effect free despite the PATCH verb.
 *
 * **There is no client-side coverage gate.** Coverage is enforced by a payment
 * rule whose threshold an organization can change — it can be lowered to accept
 * part payments — so only the server knows what "covered" means for this order.
 *
 * **Nothing is ever rolled back.** If an authorization fails partway, the ones
 * already taken stay taken: this iteration implements no refund, and the gift
 * card list is itself the recovery surface — after a reload the shopper sees
 * which cards were charged and what is left to pay. On a timeout nothing is
 * touched at all, because the payment may well have succeeded.
 */
export async function placeOrderWithPaymentSessions({
  accessToken,
  interceptors,
  order,
  attempts = DEFAULT_PLACEABLE_ATTEMPTS,
  intervalMs = DEFAULT_PLACEABLE_INTERVAL_MS,
}: PlaceOrderWithPaymentSessionsParams): Promise<PlaceOrderWithPaymentSessionsResult> {
  const sdk = getSdk({ accessToken, interceptors })
  const state = derivePaymentSessionsState(order)

  // Gift cards first, then the difference. Sequential, not concurrent: each
  // authorization changes what the next one is allowed to take.
  const toAuthorize = [...state.giftCardSessions, state.currentPaymentSession]
    .filter((session): session is PaymentSession => session != null)
    .filter(needsAuthorization)

  for (const session of toAuthorize) {
    try {
      await sdk.payment_authorizations.create({
        payment_session: sdk.payment_sessions.relationship(session.id),
      })
    } catch (error) {
      // Stop at the first failure. Carrying on would charge more cards for an
      // order that is not going to be placed.
      const errors = mapPlaceabilityErrors(error)
      if (errors.length === 0) throw error
      return { placed: false, errors, timedOut: false }
    }
  }

  let lastErrors: PlaceabilityError[] = []

  for (let attempt = 1; attempt <= attempts; attempt++) {
    try {
      const checked = await sdk.orders._placeable(order.id)

      // `auto_place` on the Payment Setting places the order inside the
      // authorization job, so it can already be placed by the time we look.
      // `_placeable` returns 200 for a placed order — `ensure_pending` only
      // promotes drafts, it does not reject anything else — so this is a
      // success, not a race to recover from.
      if (checked.status === "placed") {
        return { placed: true, order: checked, errors: [], timedOut: false }
      }

      const placed = await sdk.orders._place(order.id)
      return { placed: placed.status === "placed", order: placed, errors: [], timedOut: false }
    } catch (error) {
      lastErrors = mapPlaceabilityErrors(error)
      // An error we cannot read as a placeability refusal is not something
      // waiting will fix — surface it instead of burning the attempts.
      if (lastErrors.length === 0) throw error
      if (attempt < attempts) await sleep(intervalMs)
    }
  }

  return { placed: false, errors: lastErrors, timedOut: true }
}

/**
 * Skip the authorization when the session already has one that has not failed.
 * A `pending` or `processing` authorization is still in flight, and creating a
 * second one risks taking the money twice.
 *
 * Sessions whose authorization *did* fail never reach here: a burnt session is
 * excluded from both the current selection and the gift card list, so the
 * shopper re-selects and gets a fresh one. This stays as a guard rather than
 * because the case is expected — double-charging is the failure mode it
 * prevents, and that is worth a redundant check.
 */
function needsAuthorization(paymentSession: PaymentSession): boolean {
  return !hasLiveAuthorization(paymentSession)
}

async function sleep(ms: number): Promise<void> {
  if (ms <= 0) return
  await new Promise<void>((resolve) => setTimeout(resolve, ms))
}
