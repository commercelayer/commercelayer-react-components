import type { Order } from "@commercelayer/sdk"

/**
 * Which of the two mutually exclusive payment models an order uses.
 *
 * An order is bound to one model for its whole life and can never switch. The
 * values are named after the order relationship that carries the payment, not
 * after their age — "legacy" and "new" age badly, and "v1/v2" collides with the
 * API version, which is a different thing entirely.
 */
export type PaymentsModel =
  /** `payment_gateways` + `payment_methods` + one payment source per order. */
  | "payment_source"
  /** `payment_settings` + `payment_sessions`. */
  | "payment_sessions"
  /** The order data needed to decide has not loaded yet. */
  | "undetermined"

/**
 * Derive the Payments Model from an order.
 *
 * API version `2026-05` is purely additive, so a single response can carry
 * **both** `available_payment_methods` and `available_payment_settings`. When
 * it does, the newer model wins and the older flow is excluded entirely.
 *
 * That precedence lives here, in the library, and never in the consuming
 * application. Pushing it out — for instance by having the app blank out
 * `available_payment_methods` after fetching — turns a domain rule into
 * something every consumer has to remember, and mutates an API response to make
 * components behave.
 *
 * Pure and React-free on purpose: an application's own data layer needs the
 * same answer as the components do, and a hook cannot be called from outside a
 * component. `usePaymentsModel()` in `@commercelayer/react-components` is a
 * thin wrapper over this.
 *
 * Requires the order to have been fetched **with** `available_payment_settings`
 * in its `include`. Without it, an absent array is indistinguishable from one
 * that was never requested and this silently reports the wrong model.
 *
 * @returns the model, and `"undetermined"` when the order is missing or carries
 * neither relationship. That third state is real and observable, not a
 * transient detail: every caller has to handle it.
 */
export function getPaymentsModel(order?: Order | null): PaymentsModel {
  if (order == null) return "undetermined"
  if ((order.available_payment_settings ?? []).length > 0) return "payment_sessions"
  if ((order.available_payment_methods ?? []).length > 0) return "payment_source"
  return "undetermined"
}
