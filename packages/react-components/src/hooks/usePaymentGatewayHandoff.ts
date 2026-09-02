import { useCallback, useContext, useSyncExternalStore } from "react"
import OrderContext from "#context/OrderContext"
import {
  getHandoffSnapshot,
  type PaymentGatewayHandoff,
  subscribe,
} from "#utils/paymentGatewayStore"

const EMPTY: PaymentGatewayHandoff = {
  submit: null,
  isReady: false,
  resumePhase: "idle",
  resumeErrors: [],
}

/**
 * Read the **Payment Gateway Handoff** for the current order.
 *
 * On the `payment_sessions` model a gateway that has something to collect — a
 * card — registers a submit function here, and `<PlaceOrderButton>` calls it
 * before placing the order. This hook is the read side, for an application that
 * wants to build its own control instead of relying on the library's button:
 * `isReady` to gate it, `resumePhase` to render the window after a 3DS redirect
 * where the money is taken and the order is still being placed.
 *
 * `submit` is `null` when no gateway has registered — a manual or gift-card-only
 * order, or a card component that has not mounted yet. That is the normal case,
 * not an error.
 *
 * @example
 * ```tsx
 * const { isReady, resumePhase } = usePaymentGatewayHandoff()
 * if (resumePhase === "resuming") return <Spinner label="Completing payment…" />
 * return <MyPayButton disabled={!isReady} />
 * ```
 */
export function usePaymentGatewayHandoff(): PaymentGatewayHandoff {
  const { order } = useContext(OrderContext)
  const orderId = order?.id

  const stableSubscribe = useCallback(
    (listener: () => void) => subscribe(orderId, listener),
    [orderId]
  )
  const stableSnapshot = useCallback(() => getHandoffSnapshot(orderId), [orderId])

  return useSyncExternalStore(
    stableSubscribe,
    stableSnapshot,
    // c8 ignore next — server snapshot only used during SSR hydration
    () => EMPTY
  )
}

export default usePaymentGatewayHandoff
