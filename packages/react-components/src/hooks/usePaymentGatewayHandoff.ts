import { useCallback, useContext, useSyncExternalStore } from "react"
import OrderContext from "#context/OrderContext"
import {
  getHandoffSnapshot,
  type PaymentGatewayHandoff,
  subscribe,
} from "#utils/paymentGatewayStore"

const EMPTY: PaymentGatewayHandoff = {
  collection: null,
  collectedOutOfBand: "no",
  errors: [],
  isCollecting: false,
}

/**
 * Read the **Payment Gateway Handoff** for the current order.
 *
 * Three questions, answered separately.
 *
 * **`collection`** — who will collect. `{ by: "host" }` carries the `submit` a
 * control of your own can call, and whether the gateway is ready for it.
 * `{ by: "gateway" }` means the method has its own button and yours cannot
 * collect: disable it, and say that is why. `null` means nothing needs
 * collecting — a manual payment, or gift cards covering the order outright. All
 * three are normal; none is an error.
 *
 * **`collectedOutOfBand`** — whether a payment has already been collected
 * without a click, leaving the order still to be placed. Returning from a 3DS
 * redirect and a gateway's own button both produce it, and the library places
 * the order itself on those paths.
 *
 * **`isCollecting`** — whether a payment is under way right now: a card
 * submitted and its challenge on screen, PayPal's window open, a wallet sheet
 * up. The payment method cannot be changed until it ends, and
 * `<PaymentSetting>` refuses the switch; this is how you tell the shopper why.
 *
 * @example
 * ```tsx
 * const { collection, collectedOutOfBand, isCollecting } = usePaymentGatewayHandoff()
 * if (collectedOutOfBand === "in-progress") return <Spinner label="Completing payment…" />
 * if (isCollecting) return <Hint>Payment in progress: finish or cancel it to change method</Hint>
 * if (collection?.by === "gateway") return <Hint>Use the button above to pay</Hint>
 * return <MyPayButton disabled={collection?.by === "host" && !collection.isReady} />
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
