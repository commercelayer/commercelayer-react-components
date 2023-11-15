import { type Address } from '@commercelayer/sdk'
import useOrderContainer from '#hooks/useOrderContainer'
import { type SetNonNullable } from 'type-fest'

type AddressWithRequired = SetNonNullable<
  Address,
  | 'first_name'
  | 'last_name'
  | 'company'
  | 'full_name'
  | 'line_1'
  | 'line_2'
  | 'city'
  | 'state_code'
  | 'zip_code'
  | 'country_code'
>

export const makeAddressWithRequired = (
  address?: Address | null
): AddressWithRequired | null => {
  if (address == null) {
    return null
  }

  return {
    ...address,
    business: address?.business,
    first_name: address?.first_name ?? '',
    last_name: address?.last_name ?? '',
    company: address?.company ?? '',
    full_name: address?.full_name ?? '',
    line_1: address?.line_1 ?? '',
    line_2: address?.line_2 ?? '',
    city: address?.city ?? '',
    state_code: address?.state_code ?? '',
    zip_code: address?.zip_code ?? '',
    country_code: address?.country_code ?? '',
    billing_info: address?.first_name ?? ''
  }
}

export const useOrderAddresses = (): {
  email: string
  billing_address: AddressWithRequired | null
  shipping_address: AddressWithRequired | null
} => {
  const { order } = useOrderContainer()

  return {
    email: order?.customer_email ?? '',
    billing_address: makeAddressWithRequired(order?.billing_address),
    shipping_address: makeAddressWithRequired(order?.shipping_address)
  }
}

export const persistKey = 'cl-examples-checkoutpage-001'
