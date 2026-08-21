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

export type TCustomerAddress = AddressCreate &
  AddressUpdate &
  Record<string, string | null | undefined>

export type CustomerAddressData = {
  addresses: Address[]
}

export type CustomerInfoData = {
  customer: Customer
  customerEmail: string | undefined
}

export type {
  Address,
  Customer,
  CustomerPaymentSource,
  ListResponse,
  Order,
  OrderSubscription,
  QueryPageSize,
  QuerySort,
}
