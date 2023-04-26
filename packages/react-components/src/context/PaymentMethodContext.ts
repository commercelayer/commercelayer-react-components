import { createContext } from 'react'
import {
  type UpdatePaymentSource,
  updatePaymentSource,
  type PaymentMethodState,
  type SetPaymentMethodErrors,
  setPaymentMethodErrors,
  setPaymentSource,
  setPaymentMethod,
  destroyPaymentSource,
  type DestroyPaymentSource,
  type SetPaymentRef,
  setPaymentRef,
  setLoading
} from '#reducers/PaymentMethodReducer'

type DefaultContext = {
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
  setLoading
}

const PaymentMethodContext = createContext<DefaultContext>(
  defaultPaymentMethodContext
)

export default PaymentMethodContext
