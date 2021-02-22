import { createContext } from 'react'
import {
  PaymentMethodState,
  SetPaymentMethodErrors,
  setPaymentMethodErrors,
} from '#reducers/PaymentMethodReducer'

type DefaultContext = {
  setPaymentMethodErrors: SetPaymentMethodErrors
  // setShippingMethod: (
  //   shipmentId: string,
  //   shippingMethodId: string
  // ) => Promise<void>
} & PaymentMethodState

export const defaultPaymentMethodContext = {
  setPaymentMethodErrors,
  // setShippingMethod: async (): Promise<void> => {
  //   return
  // },
}

const PaymentMethodContext = createContext<DefaultContext>(
  defaultPaymentMethodContext
)

export default PaymentMethodContext
