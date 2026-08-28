import { useCallback, useContext, useSyncExternalStore } from "react"
import OrderContext from "#context/OrderContext"
import {
  getAcceptedSnapshot,
  setAccepted as setAcceptedInStore,
  subscribe,
} from "#utils/termsAcceptanceStore"

export interface UseTermsAndConditionsReturn {
  /** Whether the shopper has accepted the privacy policy and terms of service. */
  accepted: boolean
  /** Records the shopper's choice. `<PlaceOrderButton>` reacts immediately. */
  setAccepted: (accepted: boolean) => void
}

/**
 * Read and write privacy & terms acceptance for the current order.
 *
 * Use it to build a checkbox with your own markup instead of
 * `<PrivacyAndTermsCheckbox>`. Acceptance is what `<PlaceOrderButton>` gates on,
 * so a custom control must go through this hook — there is no other supported
 * channel.
 *
 * Acceptance is not persisted: a reload starts from `false`.
 *
 * @example
 * ```tsx
 * const { accepted, setAccepted } = useTermsAndConditions()
 * return <MyCheckbox checked={accepted} onChange={setAccepted} />
 * ```
 */
export function useTermsAndConditions(): UseTermsAndConditionsReturn {
  const { order } = useContext(OrderContext)
  const orderId = order?.id

  const stableSubscribe = useCallback(
    (listener: () => void) => subscribe(orderId, listener),
    [orderId]
  )
  const stableSnapshot = useCallback(() => getAcceptedSnapshot(orderId), [orderId])
  const accepted = useSyncExternalStore(
    stableSubscribe,
    stableSnapshot,
    // c8 ignore next — server snapshot only used during SSR hydration
    () => false
  )

  const setAccepted = useCallback(
    (value: boolean) => {
      setAcceptedInStore(orderId, value)
    },
    [orderId]
  )

  return { accepted, setAccepted }
}

export default useTermsAndConditions
