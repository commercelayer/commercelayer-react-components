import {
  SetCustomerEmail,
  setCustomerErrors,
  SetCustomerErrors,
  setCustomerEmail,
  CustomerState,
  DeleteCustomerAddress,
  deleteCustomerAddress,
} from '#reducers/CustomerReducer'
import { createContext } from 'react'

type DefaultContext = {
  saveCustomerUser: (customerEmail: string) => Promise<void>
  setCustomerErrors: SetCustomerErrors
  setCustomerEmail: SetCustomerEmail
  getCustomerPaymentSources: () => Promise<void>
  deleteCustomerAddress: DeleteCustomerAddress
} & Partial<CustomerState>

export const defaultCustomerContext = {
  saveCustomerUser: async (): Promise<void> => {
    return
  },
  getCustomerPaymentSources: async (): Promise<void> => {},
  setCustomerErrors,
  setCustomerEmail,
  deleteCustomerAddress,
}

const CustomerContext = createContext<DefaultContext>(defaultCustomerContext)

export default CustomerContext
