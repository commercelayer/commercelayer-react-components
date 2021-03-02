import { createContext } from 'react'
import {
  PaymentMethodState,
  SetPaymentMethodErrors,
  setPaymentMethodErrors,
  SetPaymentSource,
  setPaymentSource,
  SetPaymentMethod,
  setPaymentMethod,
} from '#reducers/PaymentMethodReducer'

type DefaultContext = {
  setPaymentMethodErrors: SetPaymentMethodErrors
  setPaymentMethod: SetPaymentMethod
  setPaymentSource: SetPaymentSource
} & PaymentMethodState

export const defaultPaymentMethodContext = {
  setPaymentMethodErrors,
  setPaymentMethod,
  setPaymentSource,
}

const PaymentMethodContext = createContext<DefaultContext>(
  defaultPaymentMethodContext
)

export default PaymentMethodContext
