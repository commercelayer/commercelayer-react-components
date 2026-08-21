import { createContext } from "react"
import type {
  CustomerState,
  DeleteCustomerAddressParams,
  DeleteCustomerPaymentParams,
  GetCustomerOrdersParams,
  GetCustomerSubscriptionsParams,
  SetCustomerErrors,
  SetResourceTriggerParams,
  TCustomerAddress,
} from "#typings/customers"

export type InitialCustomerContext = Partial<
  {
    saveCustomerUser: (customerEmail: string) => Promise<void>
    setCustomerErrors: SetCustomerErrors
    setCustomerEmail: (customerEmail: string) => void
    getCustomerPaymentSources: () => void
    deleteCustomerPayment: (params: DeleteCustomerPaymentParams) => Promise<void>
    deleteCustomerAddress: (params: DeleteCustomerAddressParams) => Promise<void>
    getCustomerAddresses: () => Promise<void>
    createCustomerAddress: (address: TCustomerAddress) => Promise<void>
    setResourceTrigger: (params: SetResourceTriggerParams) => Promise<boolean>
    getCustomerOrders: (props: GetCustomerOrdersParams) => Promise<void>
    getCustomerSubscriptions: (props: GetCustomerSubscriptionsParams) => Promise<void>
    reloadCustomerAddresses: () => Promise<void>
  } & CustomerState
>

export const defaultCustomerContext = {}

const CustomerContext = createContext<InitialCustomerContext>(defaultCustomerContext)

export default CustomerContext
