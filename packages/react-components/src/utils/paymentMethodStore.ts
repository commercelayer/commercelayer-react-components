import { createSharedStateStore } from "@commercelayer/core-components"
import {
  paymentMethodInitialState,
  type PaymentMethodState,
} from "#reducers/PaymentMethodReducer"

/**
 * Payment-method state shared, per order, by everything that takes part in
 * paying.
 *
 * `<PaymentMethod>` provides this state to its own children, which covers the
 * gateways and the payment sources. It does not cover `<PlaceOrderButton>`: in
 * a stepped checkout the place-order step is a sibling of the payment step, and
 * the button reads the selected method, the payment source and the form ref
 * with no fallback of its own. The deprecated `<PaymentMethodsContainer>` used
 * to sit above both; without it there is no common ancestor, so the state lives
 * here instead.
 */
export const paymentMethodStore = createSharedStateStore<PaymentMethodState>(
  paymentMethodInitialState
)
