import { useContext } from "react"
import PaymentMethodContext from "#context/PaymentMethodContext"
import { usePaymentMethod } from "#hooks/usePaymentMethod"
import type { PaymentMethodConfig } from "#reducers/PaymentMethodReducer"

/**
 * The payment-method state a component should read, whichever way the tree is
 * built.
 *
 * With `<PaymentMethodsContainer>` above — or inside `<PaymentMethod>`, which
 * provides the same context to its children — that is the context in the tree.
 * Outside both, the context is the empty default: no selected method, no
 * payment source, and dispatch-less no-ops for setters. That is what
 * `<PlaceOrderButton>` used to get at the money step, so the state comes from
 * the shared store instead.
 *
 * Only `<PaymentMethod>` passes `isOwner`; everyone else reads without
 * refetching the payment methods.
 */
export function usePaymentMethodStateContext({
  config,
  isOwner = false,
}: {
  config?: PaymentMethodConfig
  isOwner?: boolean
} = {}) {
  const parentContext = useContext(PaymentMethodContext)
  const isStandalone = parentContext._isProvided !== true
  const standalone = usePaymentMethod({ isStandalone, config, isOwner })

  return {
    isStandalone,
    paymentMethodContext: isStandalone ? standalone : parentContext,
  }
}
