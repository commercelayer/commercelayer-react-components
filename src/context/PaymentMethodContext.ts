import { createContext } from 'react'
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
  setLoading: typeof setLoading
} & PaymentMethodState

export const defaultPaymentMethodContext = {
  setPaymentMethodErrors,
  setPaymentMethod,
  setPaymentSource,
  setPaymentRef,
  destroyPaymentSource,
  setLoading,
}

const PaymentMethodContext = createContext<DefaultContext>(
  defaultPaymentMethodContext
)

export default PaymentMethodContext
