import type {
  Address,
  AddressCreate,
  AddressUpdate,
  Customer,
  CustomerPaymentSource,
  ListResponse,
  Order,
  OrderSubscription,
  QueryPageSize,
  QuerySort,
} from "@commercelayer/sdk"
import type { BaseError } from "#typings/errors"

export type TCustomerAddress = AddressCreate &
  AddressUpdate &
  Record<string, string | null | undefined>

export interface CustomerActionPayload {
  addresses: Address[] | null
  payments: CustomerPaymentSource[] | null
  customerEmail: string | undefined
  errors: BaseError[]
  orders: ListResponse<Order>
  subscriptions: ListResponse<OrderSubscription> | ListResponse<Order> | null
  isGuest: boolean
  customers: Customer
}

export type CustomerState = Partial<CustomerActionPayload>

export interface GetCustomerOrdersParams {
  pageNumber?: number
  pageSize?: QueryPageSize
  sortBy?: QuerySort<Order>
}

export interface GetCustomerSubscriptionsParams extends GetCustomerOrdersParams {
  id?: string
}

export interface DeleteCustomerPaymentParams {
  customerPaymentSourceId: string
}

export interface DeleteCustomerAddressParams {
  customerAddressId: string
}

export interface SetResourceTriggerParams {
  resource: "orders" | "order_subscriptions"
  attribute: string
  id: string
  customerId?: string
  pageSize?: QueryPageSize
  pageNumber?: number
  reloadList?: boolean
}

export type SetCustomerErrors = (errors: BaseError[]) => void

export const customerInitialState: CustomerState = {
  errors: [],
  addresses: null,
  payments: null,
}
