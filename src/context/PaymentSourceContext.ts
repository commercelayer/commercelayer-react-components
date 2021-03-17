import { createContext } from 'react'

export type iconBrand =
  | 'visa'
  | 'credit-card'
  | 'amex'
  | 'mastercard'
  | 'jcb'
  | 'wire-transfer'
  | 'maestro'
  | 'cirrus'
  | 'paypal'

type DefaultContext = {
  brand?: iconBrand
  expMonth?: number
  expYear?: number
  last4?: string
}

export const defaultPaymentSourceContext = {}

const PaymentMethodContext = createContext<DefaultContext>(
  defaultPaymentSourceContext
)

export default PaymentMethodContext
