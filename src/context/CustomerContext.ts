import {
  SetCustomerErrors,
  deleteCustomerAddress,
  CustomerState,
  GetCustomerAddresses,
  getCustomerPaymentSources,
  setCustomerEmail,
  TCustomerAddress,
} from '#reducers/CustomerReducer'
import { createContext } from 'react'

export type InitialCustomerContext = Partial<
  {
    saveCustomerUser: (customerEmail: string) => Promise<void>
    setCustomerErrors: SetCustomerErrors
    setCustomerEmail: typeof setCustomerEmail
    getCustomerPaymentSources: typeof getCustomerPaymentSources
    deleteCustomerAddress: typeof deleteCustomerAddress | undefined
    getCustomerAddresses: GetCustomerAddresses
    createCustomerAddress: (address: TCustomerAddress) => Promise<void>
  } & CustomerState
>

export const defaultCustomerContext = {}

const CustomerContext = createContext<InitialCustomerContext>(
  defaultCustomerContext
)

export default CustomerContext
