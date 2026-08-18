import { useContext, useMemo } from "react"
import OrderContext from "#context/OrderContext"

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
 * Derive the Payments Model from the order.
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
 * The derivation is pure: it never fetches and holds no state of its own, so it
 * cannot drift from the order it describes. It relies on `<Order>` having
 * registered `available_payment_settings` in the order include, which it does
 * for every consumer — without that, an absent array would be indistinguishable
 * from one that was never requested.
 *
 * @returns the model, and `"undetermined"` until the order is loaded. That
 * third state is real and observable, not a transient detail: every caller has
 * to render something sensible for it.
 */
export function usePaymentsModel(): PaymentsModel {
  const { order } = useContext(OrderContext)

  return useMemo(() => {
    if (order == null) return "undetermined"
    if ((order.available_payment_settings ?? []).length > 0) return "payment_sessions"
    if ((order.available_payment_methods ?? []).length > 0) return "payment_source"
    return "undetermined"
  }, [order])
}

export default usePaymentsModel
