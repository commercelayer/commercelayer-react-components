import type { Order, PaymentSession } from "@commercelayer/sdk"
import { getSdk } from "#sdk"
import type { RequestConfig } from "#types"
import { derivePaymentSessionsState } from "./derivePaymentSessionsState"
import { mapPlaceabilityErrors } from "./mapPlaceabilityErrors"
import {
  hasAuthorizationInFlight,
  hasFailedAuthorization,
  hasLiveAuthorization,
  type PlaceabilityError,
} from "./types"

/**
 * Attempts before the placeability check gives up.
 *
 * Each attempt starts by reading the order back, so an attempt spent waiting
 * for an authorization costs one `GET` rather than a refused `PATCH`. That
 * makes attempts cheap enough to run more of them, more closely spaced, than
 * when every one of them was a `_placeable` call.
 */
export const DEFAULT_PLACEABLE_ATTEMPTS = 8
/** Delay between placeability attempts, in milliseconds. */
export const DEFAULT_PLACEABLE_INTERVAL_MS = 500

/**
 * Attempts to use when a **gateway** collected the payment client-side.
 *
 * The defaults above are sized for a setting whose authorization is a local
 * background job — manual, gift card — where the whole wait is one Sidekiq hop.
 * A card taken through Adyen's Drop-in is different in kind: Commerce Layer's
 * own gateway call fails by construction, and the authorization only reaches
 * `succeeded` when Adyen's `AUTHORISATION` webhook arrives. That is a round trip
 * through a third party, and four seconds is not a realistic budget for it.
 *
 * Exhausting these is still **not** a payment failure — the webhook may land a
 * moment later — which is why the result reports `timedOut` separately from
 * `errors`.
 */
export const DEFAULT_GATEWAY_PLACEABLE_ATTEMPTS = 20
/** Delay between gateway placeability attempts, in milliseconds. */
export const DEFAULT_GATEWAY_PLACEABLE_INTERVAL_MS = 1000

/** Order includes the placeability loop needs to read authorization states. */
const AUTHORIZATION_INCLUDES = ["payment_sessions.payment_authorization"]

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
 * asynchronous — it runs in a background job — so a check taken while the money
 * is still being taken legitimately fails with "the payment doesn't cover the
 * required percentage". Reporting that straight away would tell the shopper
 * their payment failed a second before it succeeded. Only an error that
 * survives the last attempt is real. A failed `_placeable` persists nothing, so
 * retrying is side-effect free despite the PATCH verb.
 *
 * **Why each attempt reads the order first.** The authorization states are the
 * only thing that says whether a refusal is worth waiting on, and `_placeable`
 * cannot see them — so asking it while an authorization is in flight produces a
 * guaranteed 422 that means nothing. Reading the order first turns that wasted
 * attempt into a cheap `GET` and buys three things:
 *
 * - an authorization that has already **failed** ends the loop at once, instead
 *   of spending the whole budget waiting for a verdict that has arrived;
 * - an order `auto_place` has already placed is recognised wherever in the
 *   sequence it happens, not only at the point the old code looked;
 * - the cost is flat in the number of sessions. Every authorization state
 *   arrives in the same `GET`, so orders paying with several gift cards poll no
 *   harder than one paying with a single method — which is what a per-session
 *   wait, concurrent or not, could not promise.
 *
 * **The last attempt always asks.** When the budget runs out with an
 * authorization still in flight, `_placeable` is called anyway: its refusal is
 * the only message the API will give us, and returning none would leave the
 * shopper with a failed place and nothing on screen.
 *
 * **A failed authorization still gets its message from `_placeable`.** A
 * Payment Authorization carries no error attribute — only `status`, balances
 * and the gateway's raw `response_data` — so there is nothing better to report,
 * and inventing copy here would put payment wording in a package that has no
 * business owning it. What changes is the timing: the refusal is returned as
 * soon as the authorization settles, with `timedOut: false`, because a settled
 * failure is a real answer rather than latency.
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

  // The sessions paying for this order, by the same derivation the rest of the
  // payment UI uses. Kept as a set because the placeability loop has to tell
  // them apart from sessions merely sitting on the order: an authorization that
  // failed on an earlier attempt stays there, and reading it as this attempt's
  // verdict would end the loop before the authorization just created has had a
  // chance to settle.
  const payingSessions = [...state.giftCardSessions, state.currentPaymentSession].filter(
    (session): session is PaymentSession => session != null
  )
  const payingSessionIds = new Set(payingSessions.map((session) => session.id))

  // Gift cards first, then the difference. Sequential, not concurrent: each
  // authorization changes what the next one is allowed to take.
  const toAuthorize = payingSessions.filter(needsAuthorization)

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
    const isLastAttempt = attempt === attempts
    const current = await sdk.orders.retrieve(order.id, { include: AUTHORIZATION_INCLUDES })

    // `auto_place` on the Payment Setting places the order inside the
    // authorization job, so it can be placed before we ever ask to place it.
    if (current.status === "placed") {
      return { placed: true, order: current, errors: [], timedOut: false }
    }

    const sessions = (current.payment_sessions ?? []).filter((session) =>
      payingSessionIds.has(session.id)
    )
    const failed = sessions.some(hasFailedAuthorization)

    // Nothing `_placeable` says while the money is still moving is worth
    // reporting, so do not spend a PATCH asking — unless this is the last
    // attempt, whose refusal is the only message we will have to show.
    if (!failed && !isLastAttempt && sessions.some(hasAuthorizationInFlight)) {
      await sleep(intervalMs)
      continue
    }

    try {
      const checked = await sdk.orders._placeable(order.id)

      // `_placeable` returns 200 for a placed order — `ensure_pending` only
      // promotes drafts, it does not reject anything else — so a placed order
      // here is a success, not a race to recover from.
      if (checked.status === "placed") {
        return { placed: true, order: checked, errors: [], timedOut: false }
      }

      return await placeOrRecover(sdk, order.id)
    } catch (error) {
      lastErrors = mapPlaceabilityErrors(error)
      // An error we cannot read as a placeability refusal is not something
      // waiting will fix — surface it instead of burning the attempts.
      if (lastErrors.length === 0) throw error
      // A failed authorization is a verdict, not latency. Retrying would only
      // delay the same answer, and `timedOut` would misreport a settled
      // refusal as a payment that might still succeed.
      if (failed) return { placed: false, errors: lastErrors, timedOut: false }
      if (attempt < attempts) await sleep(intervalMs)
    }
  }

  return { placed: false, errors: lastErrors, timedOut: true }
}

/**
 * `_place` the order, treating "already placed" as the success it is.
 *
 * `auto_place` can fire in the window between the placeability check passing
 * and this call. `_place` then refuses an order that was placed successfully,
 * and — being a state error rather than a payment rule — the refusal does not
 * map to a placeability error, so it would be rethrown as a hard failure on an
 * order that is paid for and placed. Reading the order back is the only way to
 * tell that apart from a genuine refusal.
 */
async function placeOrRecover(
  sdk: ReturnType<typeof getSdk>,
  orderId: string
): Promise<PlaceOrderWithPaymentSessionsResult> {
  try {
    const placed = await sdk.orders._place(orderId)
    return { placed: placed.status === "placed", order: placed, errors: [], timedOut: false }
  } catch (error) {
    const current = await sdk.orders.retrieve(orderId).catch(() => undefined)
    if (current?.status === "placed") {
      return { placed: true, order: current, errors: [], timedOut: false }
    }
    // Not placed after all: let the caller's loop map and report it as before.
    throw error
  }
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
