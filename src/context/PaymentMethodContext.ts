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
} from '#reducers/PaymentMethodReducer'

type DefaultContext = {
  setPaymentMethodErrors: SetPaymentMethodErrors
  setPaymentMethod: SetPaymentMethod
  setPaymentSource: SetPaymentSource
  destroyPaymentSource: DestroyPaymentSource
} & PaymentMethodState

export const defaultPaymentMethodContext = {
  setPaymentMethodErrors,
  setPaymentMethod,
  setPaymentSource,
  destroyPaymentSource,
}

const PaymentMethodContext = createContext<DefaultContext>(
  defaultPaymentMethodContext
)

export default PaymentMethodContext
