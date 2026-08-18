import type { Order, PaymentSession } from "@commercelayer/sdk"
import { getSdk } from "#sdk"
import type { RequestConfig } from "#types"
import { mapPlaceabilityErrors } from "./mapPlaceabilityErrors"
import { type PlaceabilityError, TERMINAL_FAILURE_TRANSACTION_STATUSES } from "./types"

/** Attempts before the placeability check gives up. */
export const DEFAULT_PLACEABLE_ATTEMPTS = 5
/** Delay between placeability attempts, in milliseconds. */
export const DEFAULT_PLACEABLE_INTERVAL_MS = 1000

interface PlaceOrderWithPaymentSessionsParams
  extends Pick<RequestConfig, "accessToken" | "interceptors"> {
  orderId: string
  /**
   * The Current Payment Session to authorize. Omit for an order that needs no
   * payment (a zero-total order), which goes straight to the placeability
   * check.
   */
  paymentSession?: PaymentSession | null
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
  /** Reasons the order could not be placed, from the final failed attempt. */
  errors: PlaceabilityError[]
  /**
   * True when the attempts ran out. The payment may still succeed later, so
   * this must never be reported as a payment failure — see below.
   */
  timedOut: boolean
}

/**
 * Take payment for an order on the `payment_sessions` model and place it.
 *
 * The sequence is: create the Payment Authorization, poll `_placeable` until
 * the API accepts, then `_place`.
 *
 * **Why the authorization is created here and not at selection.** An
 * authorization is the record proving money was taken. Creating it when the
 * shopper picks a radio button would take their money on selection and make
 * changing their mind a cascade delete of an accounting record. Creating it
 * here keeps selection free and reversible.
 *
 * **Why `_placeable` is retried instead of reported.** Authorizing is
 * asynchronous — for a manual setting it runs in a background job — so the
 * first check legitimately fails with "the payment doesn't cover the required
 * percentage" while the money is still being taken. Reporting that straight
 * away would tell the shopper their payment failed a second before it
 * succeeded. Only an error that survives the last attempt is real.
 *
 * A failed `_placeable` persists nothing (the trigger is a validation, and a
 * failed validation is not saved), so retrying it is cheap and side-effect
 * free despite the PATCH verb.
 *
 * **There is no client-side coverage gate.** Coverage is enforced by a payment
 * rule whose threshold an organization can change — it can be lowered to accept
 * part payments — so only the server knows what "covered" means for this order.
 */
export async function placeOrderWithPaymentSessions({
  accessToken,
  interceptors,
  orderId,
  paymentSession,
  attempts = DEFAULT_PLACEABLE_ATTEMPTS,
  intervalMs = DEFAULT_PLACEABLE_INTERVAL_MS,
}: PlaceOrderWithPaymentSessionsParams): Promise<PlaceOrderWithPaymentSessionsResult> {
  const sdk = getSdk({ accessToken, interceptors })

  if (paymentSession != null && needsAuthorization(paymentSession)) {
    await sdk.payment_authorizations.create({
      payment_session: sdk.payment_sessions.relationship(paymentSession.id),
    })
  }

  let lastErrors: PlaceabilityError[] = []

  for (let attempt = 1; attempt <= attempts; attempt++) {
    try {
      const checked = await sdk.orders._placeable(orderId)

      // `auto_place` on the Payment Setting places the order inside the
      // authorization job, so it can already be placed by the time we look.
      // `_placeable` returns 200 for a placed order — `ensure_pending` only
      // promotes drafts, it does not reject anything else — so this is a
      // success, not a race to recover from.
      if (checked.status === "placed") {
        return { placed: true, order: checked, errors: [], timedOut: false }
      }

      const placed = await sdk.orders._place(orderId)
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
 * Skip the authorization when the session already has one that is still alive.
 * Only a terminal failure means the shopper is genuinely retrying; a `pending`
 * or `processing` authorization is still in flight, and creating a second one
 * risks taking the money twice.
 */
function needsAuthorization(paymentSession: PaymentSession): boolean {
  const status = paymentSession.payment_authorization?.status
  if (status == null) return true
  return TERMINAL_FAILURE_TRANSACTION_STATUSES.includes(
    status as (typeof TERMINAL_FAILURE_TRANSACTION_STATUSES)[number]
  )
}

async function sleep(ms: number): Promise<void> {
  if (ms <= 0) return
  await new Promise<void>((resolve) => setTimeout(resolve, ms))
}
