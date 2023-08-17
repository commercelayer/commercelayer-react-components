import { createContext } from 'react'

export type IconBrand =
  | 'visa'
  | 'credit-card'
  | 'amex'
  | 'mastercard'
  | 'jcb'
  | 'wire-transfer'
  | 'maestro'
  | 'cirrus'
  | 'paypal'

interface DefaultContext {
  brand?: IconBrand | string
  exp_month?: number | string
  exp_year?: number | string
  last4?: string
  issuer_type?: string
  showCard?: boolean
  readonly?: boolean
  handleEditClick?: (e: MouseEvent) => void
}

export const defaultPaymentSourceContext = {}

const PaymentSourceContext = createContext<DefaultContext>(
  defaultPaymentSourceContext
)

export default PaymentSourceContext
