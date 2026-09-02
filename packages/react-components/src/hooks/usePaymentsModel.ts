import { getPaymentsModel, type PaymentsModel } from "@commercelayer/core-components"
import { useContext, useMemo } from "react"
import OrderContext from "#context/OrderContext"

export type { PaymentsModel }

/**
 * Derive the Payments Model from the order in `OrderContext`.
 *
 * The rule itself — including the precedence of `available_payment_settings`
 * over `available_payment_methods` — lives in `getPaymentsModel`, so an
 * application's own data layer reaches the same answer without a hook. See
 * that function for the reasoning; this is only the React binding.
 *
 * The derivation is pure: it never fetches and holds no state of its own, so it
 * cannot drift from the order it describes. It relies on `<Order>` having
 * registered `available_payment_settings` in the order include, which it does
 * for every consumer.
 */
export function usePaymentsModel(): PaymentsModel {
  const { order } = useContext(OrderContext)
  return useMemo(() => getPaymentsModel(order), [order])
}

export default usePaymentsModel
