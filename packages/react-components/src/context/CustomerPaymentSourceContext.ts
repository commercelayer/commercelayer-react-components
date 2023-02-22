import { createContext } from 'react'
import { IconBrand } from './PaymentSourceContext'

interface DefaultContext {
  brand?: IconBrand | string
  exp_month?: number | string
  exp_year?: number | string
  last4?: string
}

export const defaultCustomerPaymentSourceContext = {}

const CustomerPaymentSourceContext = createContext<DefaultContext>(
  defaultCustomerPaymentSourceContext
)

export default CustomerPaymentSourceContext
