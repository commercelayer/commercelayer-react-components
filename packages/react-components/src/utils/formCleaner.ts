/* eslint-disable @typescript-eslint/no-dynamic-delete */
import type { TCustomerAddress } from '#reducers/CustomerReducer'

type CombinedAddressType = TCustomerAddress | undefined

export function formCleaner(address: CombinedAddressType): CombinedAddressType {
  if (!address) {
    return address
  }
  Object.keys(address).forEach((key) => {
    const keyCleaned = key
      .replace('shipping_address_', '')
      .replace('billing_address_', '')
    const isNotCleaned =
      key.startsWith('shipping_address_') || key.startsWith('billing_address_')
    if (isNotCleaned) {
      address[keyCleaned] = address[key]
      delete address[key]
    }
    if (keyCleaned === 'save_to_customer_book') {
      delete address[keyCleaned]
    }
  })
  return address
}
