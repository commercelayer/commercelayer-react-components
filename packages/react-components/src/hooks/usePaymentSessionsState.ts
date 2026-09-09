import {
  derivePaymentSessionsState,
  type PaymentSessionsState,
} from "@commercelayer/core-components"
import { useContext, useMemo } from "react"
import OrderContext from "#context/OrderContext"

export type { PaymentSessionsState }

/**
 * Everything the payment UI needs to know about the order's Payment Sessions:
 * the applied gift cards, what is still owed, whether anything is left to pay,
 * and which session pays the difference.
 *
 * Exported because five different places need the same numbers — the gift card
 * components, the method selector, `<TotalAmount>`, `<GiftCardAmount>`, and a
 * consuming application deciding whether payment is still required. Deriving
 * them separately is how those end up disagreeing.
 *
 * The rule lives in `derivePaymentSessionsState`, so an application's own data
 * layer reaches the same answer without a hook. This is only the React binding.
 */
export function usePaymentSessionsState(): PaymentSessionsState {
  const { order } = useContext(OrderContext)
  return useMemo(() => derivePaymentSessionsState(order), [order])
}

export default usePaymentSessionsState
