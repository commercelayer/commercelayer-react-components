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
  deleteCustomerAddress: DeleteCustomerAddress
} & Partial<CustomerState>

export const defaultCustomerContext = {
  saveCustomerUser: async (): Promise<void> => {
    return
  },
  setCustomerErrors,
  setCustomerEmail,
  deleteCustomerAddress,
}

const CustomerContext = createContext<DefaultContext>(defaultCustomerContext)

export default CustomerContext
