import type {
  SetCustomerErrors,
  deleteCustomerAddress,
  CustomerState,
  getCustomerPaymentSources,
  setCustomerEmail,
  TCustomerAddress,
  getCustomerAddresses,
  getCustomerOrders,
  getCustomerSubscriptions,
  setResourceTrigger
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
    setResourceTrigger: typeof setResourceTrigger
    getCustomerOrders: (
      props: Partial<Parameters<typeof getCustomerOrders>[0]>
    ) => Promise<void>
    getCustomerSubscriptions: (
      props: Partial<Parameters<typeof getCustomerSubscriptions>[0]>
    ) => Promise<void>
    reloadCustomerAddresses: () => Promise<void>
  } & CustomerState
>

export const defaultCustomerContext = {}

const CustomerContext = createContext<InitialCustomerContext>(
  defaultCustomerContext
)

export default CustomerContext
