import {
  type SetCustomerErrors,
  type deleteCustomerAddress,
  type CustomerState,
  type getCustomerPaymentSources,
  type setCustomerEmail,
  type TCustomerAddress,
  type getCustomerAddresses
} from '#reducers/CustomerReducer'
import { createContext } from 'react'

export type InitialCustomerContext = Partial<
  {
    saveCustomerUser: (customerEmail: string) => Promise<void>
    setCustomerErrors: SetCustomerErrors
    setCustomerEmail: typeof setCustomerEmail
    getCustomerPaymentSources: typeof getCustomerPaymentSources
    deleteCustomerAddress: typeof deleteCustomerAddress
    getCustomerAddresses: typeof getCustomerAddresses
    createCustomerAddress: (address: TCustomerAddress) => Promise<void>
  } & CustomerState
>

export const defaultCustomerContext = {}

const CustomerContext = createContext<InitialCustomerContext>(
  defaultCustomerContext
)

export default CustomerContext
