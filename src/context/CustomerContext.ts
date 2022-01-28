import {
  SetCustomerEmail,
  setCustomerErrors,
  SetCustomerErrors,
  setCustomerEmail,
  CustomerState,
} from '#reducers/CustomerReducer'
import { createContext } from 'react'

type DefaultContext = {
  saveCustomerUser: (customerEmail: string) => Promise<void>
  setCustomerErrors: SetCustomerErrors
  setCustomerEmail: SetCustomerEmail
  getCustomerPaymentSources: () => Promise<void>
} & Partial<CustomerState>

export const defaultCustomerContext = {
  saveCustomerUser: async (): Promise<void> => {
    return
  },
  getCustomerPaymentSources: async (): Promise<void> => {
    return
  },
  setCustomerErrors,
  setCustomerEmail,
}

const CustomerContext = createContext<DefaultContext>(defaultCustomerContext)

export default CustomerContext
