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
  exp_month?: number
  exp_year?: number
  last4?: string
  showCard?: boolean
  readonly?: boolean
  handleEditClick?: (e: MouseEvent) => void
}

export const defaultPaymentSourceContext = {}

const PaymentSourceContext = createContext<DefaultContext>(
  defaultPaymentSourceContext
)

export default PaymentSourceContext
