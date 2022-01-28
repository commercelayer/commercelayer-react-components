import {
  SetCustomerEmail,
  setCustomerErrors,
  SetCustomerErrors,
  setCustomerEmail,
  CustomerState,
  DeleteCustomerAddress,
  deleteCustomerAddress,
  GetCustomerAddresses,
  getCustomerAddresses,
} from '#reducers/CustomerReducer'
import { createContext } from 'react'

type DefaultContext = {
  saveCustomerUser: (customerEmail: string) => Promise<void>
  setCustomerErrors: SetCustomerErrors
  setCustomerEmail: SetCustomerEmail
  getCustomerPaymentSources: () => Promise<void>
  deleteCustomerAddress: DeleteCustomerAddress
  getCustomerAddresses: GetCustomerAddresses
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
  deleteCustomerAddress,
  getCustomerAddresses,
}

const CustomerContext = createContext<DefaultContext>(defaultCustomerContext)

export default CustomerContext
