import { createContext } from "react"
import {
  type DestroyPaymentSource,
  destroyPaymentSource,
  type PaymentMethodState,
  type SetPaymentMethodErrors,
  type SetPaymentRef,
  setLoading,
  setPaymentMethod,
  setPaymentMethodErrors,
  setPaymentRef,
  setPaymentSource,
  type UpdatePaymentSource,
  updatePaymentSource,
} from "#reducers/PaymentMethodReducer"

type DefaultContext = {
  /** Set by `<PaymentMethodsContainer>` (or the standalone hook) to signal the context is provided. */
  _isProvided?: true
  setPaymentMethodErrors: SetPaymentMethodErrors
  setPaymentMethod: typeof setPaymentMethod
  setPaymentSource: typeof setPaymentSource
  setPaymentRef: SetPaymentRef
  destroyPaymentSource: DestroyPaymentSource
  updatePaymentSource: UpdatePaymentSource
  setLoading: typeof setLoading
} & PaymentMethodState

export const defaultPaymentMethodContext: DefaultContext = {
  setPaymentMethodErrors,
  setPaymentMethod,
  setPaymentSource,
  setPaymentRef,
  destroyPaymentSource,
  updatePaymentSource,
  setLoading,
}

const PaymentMethodContext = createContext<DefaultContext>(defaultPaymentMethodContext)

export default PaymentMethodContext
