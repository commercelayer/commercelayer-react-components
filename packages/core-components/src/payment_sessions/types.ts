/**
 * Status values for the `payment_sessions` payment model.
 *
 * The SDK types every one of these as a bare `string`, so these unions are
 * transcribed by hand from the AASM state machines in `core-api`. Each is
 * widened with `(string & {})` so an unknown value stays assignable: the
 * server can add a state without breaking consumers, and every branch that
 * decides on a status is required to have a `default`.
 *
 * **Re-check these against `core-api` whenever the SDK is upgraded.**
 */

/** Any value the API may send, while still autocompleting the known ones. */
type Widen<T extends string> = T | (string & {})

/**
 * `app/models/payment_session.rb:21-28` — initial state is `unpaid`.
 * Note there are no per-state timestamp columns on payment sessions, unlike
 * transactions, so `status` is the only way to read a session's state.
 */
export type KnownPaymentSessionStatus =
  | "unpaid"
  | "authorized"
  | "voided"
  | "paid"
  | "partially_paid"
  | "refunded"
  | "partially_refunded"

export type PaymentSessionStatus = Widen<KnownPaymentSessionStatus>

/**
 * The subset of session states that count toward the order's paid amount.
 * `app/models/payment_session.rb:15` (`PAYMENT_TAKEN_STATES`).
 */
export const PAYMENT_TAKEN_SESSION_STATUSES = [
  "authorized",
  "paid",
  "partially_paid",
] as const satisfies readonly KnownPaymentSessionStatus[]

/**
 * `app/models/payment_transaction.rb:22-31` — initial state is `pending`.
 * Shared by all four STI subclasses: payment authorizations, captures, voids
 * and refunds run the same machine.
 */
export type KnownPaymentTransactionStatus =
  | "pending"
  | "requires_action"
  | "processing"
  | "succeeded"
  | "declined"
  | "failed"
  | "canceled"
  | "expired"

export type PaymentTransactionStatus = Widen<KnownPaymentTransactionStatus>

/**
 * Transaction states a session cannot recover from. A session carrying an
 * authorization in one of these is burnt: it stays `unpaid` forever, because
 * only a `succeeded` authorization transitions the session.
 */
export const TERMINAL_FAILURE_TRANSACTION_STATUSES = [
  "declined",
  "failed",
  "canceled",
  "expired",
] as const satisfies readonly KnownPaymentTransactionStatus[]

/**
 * One reason the API gave for refusing to place an order, mapped out of a 422
 * JSON:API error object.
 *
 * Note that every payment-rule failure — insufficient coverage, a payment
 * setting the order is not allowed to use — arrives with the same
 * `field: "payment_action"`, distinguishable only by `message`.
 */
export interface PlaceabilityError {
  /** JSON:API error `code`, e.g. `"VALIDATION_ERROR"`. */
  code: string
  /** Human-readable reason. For payment rules this is the rule's message. */
  message: string
  /**
   * Last segment of `source.pointer`, so `/data/attributes/payment_action`
   * becomes `"payment_action"`. Base errors (`/data`) become `"base"`.
   */
  field?: string
  /** Symbolic reason from `meta.error`, when the API sends one. */
  meta?: { error: string }
}
