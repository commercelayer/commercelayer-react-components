import { createContext } from 'react'
import type { IconBrand } from './PaymentSourceContext'

interface DefaultContext {
  brand?: IconBrand | string
  exp_month?: number | string
  exp_year?: number | string
  last4?: string
  issuer_type?: string
}

export const defaultCustomerPaymentSourceContext = {}

const CustomerPaymentSourceContext = createContext<DefaultContext>(
  defaultCustomerPaymentSourceContext
)

export default CustomerPaymentSourceContext
