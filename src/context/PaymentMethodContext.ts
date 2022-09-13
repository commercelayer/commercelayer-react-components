import { createContext } from 'react'
import {
  UpdatePaymentSource,
  updatePaymentSource,
} from '#reducers/PaymentMethodReducer'
import {
  PaymentMethodState,
  SetPaymentMethodErrors,
  setPaymentMethodErrors,
  SetPaymentSource,
  setPaymentSource,
  SetPaymentMethod,
  setPaymentMethod,
  destroyPaymentSource,
  DestroyPaymentSource,
  SetPaymentRef,
  setPaymentRef,
  setLoading,
} from '#reducers/PaymentMethodReducer'

type DefaultContext = {
  setPaymentMethodErrors: SetPaymentMethodErrors
  setPaymentMethod: SetPaymentMethod
  setPaymentSource: SetPaymentSource
  setPaymentRef: SetPaymentRef
  destroyPaymentSource: DestroyPaymentSource
  updatePaymentSource: UpdatePaymentSource
  setLoading: typeof setLoading
} & PaymentMethodState

export const defaultPaymentMethodContext = {
  setPaymentMethodErrors,
  setPaymentMethod,
  setPaymentSource,
  setPaymentRef,
  destroyPaymentSource,
  updatePaymentSource,
  setLoading,
}

const PaymentMethodContext = createContext<DefaultContext>(
  defaultPaymentMethodContext
)

export default PaymentMethodContext
