import type { PaymentSession } from "@commercelayer/sdk"

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
 * Transaction states the API will leave on its own, without anyone acting.
 * Authorizing runs in a background job, so an authorization sits here between
 * the `POST` that creates it and the money actually being taken.
 *
 * `requires_action` is deliberately **not** here. It is waiting for the
 * *shopper* — a 3DS challenge or an equivalent redirect — so no amount of
 * polling resolves it, and treating it as in flight would spend the whole
 * retry budget on something that needs a flow this iteration does not
 * implement. It is not a failure either (see
 * `TERMINAL_FAILURE_TRANSACTION_STATUSES`), so it falls through to the
 * placeability check and is reported as the API describes it.
 */
export const IN_FLIGHT_TRANSACTION_STATUSES = [
  "pending",
  "processing",
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

/**
 * The Payment Setting type a gift card is spent through.
 *
 * Gift cards are the one setting that is *additive* rather than an alternative:
 * an order carries zero or more of them plus at most one other session for the
 * difference. Everything that separates the two families keys off this literal.
 */
export const GIFT_CARD_SETTING_TYPE = "payment_setting_gift_cards"

/** True when this session spends a gift card rather than paying the difference. */
export function isGiftCardSession(session: PaymentSession): boolean {
  return session.payment_setting?.type === GIFT_CARD_SETTING_TYPE
}

/**
 * True when the session is carrying a Payment Authorization that has not failed
 * — i.e. money is either taken or in flight.
 *
 * Note this is *not* "paid": an authorization can still be `pending` while its
 * background job runs. What it rules out is a session the shopper may still
 * change freely.
 */
export function hasLiveAuthorization(session: PaymentSession): boolean {
  const status = session.payment_authorization?.status
  if (status == null) return false
  return !TERMINAL_FAILURE_TRANSACTION_STATUSES.includes(
    status as (typeof TERMINAL_FAILURE_TRANSACTION_STATUSES)[number]
  )
}

/**
 * True when the session's authorization is still being worked on server-side.
 *
 * This is the state the placeability check cannot see through: the money is
 * neither taken nor refused, so a refusal read while this holds says nothing
 * about whether the payment will succeed.
 */
export function hasAuthorizationInFlight(session: PaymentSession): boolean {
  const status = session.payment_authorization?.status
  if (status == null) return false
  return IN_FLIGHT_TRANSACTION_STATUSES.includes(
    status as (typeof IN_FLIGHT_TRANSACTION_STATUSES)[number]
  )
}

/**
 * True when the session's authorization reached a state it cannot leave.
 *
 * Note the API exposes no reason for it: a Payment Authorization carries only
 * `status`, the balances and the gateway's raw `response_data`
 * (`config/attributes/payment_authorization.yml` in `core-api`). So this
 * answers *whether* waiting is pointless, never *why* the payment failed —
 * the message still has to come from the API's own refusal.
 */
export function hasFailedAuthorization(session: PaymentSession): boolean {
  const status = session.payment_authorization?.status
  if (status == null) return false
  return TERMINAL_FAILURE_TRANSACTION_STATUSES.includes(
    status as (typeof TERMINAL_FAILURE_TRANSACTION_STATUSES)[number]
  )
}

/**
 * The Payment Setting type Adyen cards are taken through.
 *
 * Unlike gift cards, this is one of the alternatives the shopper picks between,
 * so it stays inside the radio group. What separates it from `manual` is that a
 * gateway has to collect something before the order can be placed.
 */
export const ADYEN_SETTING_TYPE = "payment_setting_adyens"

/** True when this session pays through Adyen. */
export function isAdyenSession(session?: PaymentSession | null): boolean {
  return session?.payment_setting?.type === ADYEN_SETTING_TYPE
}

/**
 * The gateway-side session `adyen-web` needs, as Adyen names its own fields.
 *
 * Distinct from the Payment Session that owns it: this is what
 * `AdyenCheckout({ session })` is constructed with.
 */
export interface AdyenSession {
  id: string
  sessionData: string
}

/**
 * Read the Adyen Session out of a Payment Session.
 *
 * It lives in `response_data`, which is the response Commerce Layer got from
 * Adyen `/sessions` passed through verbatim — hence Adyen's camelCase
 * `sessionData` beside a bare `id`. That attribute is deliberately readable by
 * sales-channel tokens (`config/attributes/payment_session.yml`, *"used by
 * client"*), unlike `payment_authorization.response_data`, which is withheld.
 *
 * Returns `undefined` unless **both** fields are present and non-empty. A
 * partial Adyen Session is not something to boot a Drop-in from, and the two
 * ways of getting one — a consumer whose `fields` allowlist omits
 * `response_data`, or a session whose gateway call failed — are both better
 * reported as "no Adyen session" than as a Drop-in that fails inside the SDK.
 */
export function readAdyenSession(session?: PaymentSession | null): AdyenSession | undefined {
  const data = session?.response_data
  if (data == null || typeof data !== "object") return undefined
  const { id, sessionData } = data as { id?: unknown; sessionData?: unknown }
  if (typeof id !== "string" || id === "") return undefined
  if (typeof sessionData !== "string" || sessionData === "") return undefined
  return { id, sessionData }
}
