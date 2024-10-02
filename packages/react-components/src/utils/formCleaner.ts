/* eslint-disable @typescript-eslint/no-dynamic-delete */
import { type AddressSchema } from '#reducers/AddressReducer'

export function formCleaner(address: AddressSchema): AddressSchema {
  Object.keys(address).forEach((key) => {
    const keyCleaned = key
      .replace('shipping_address_', '')
      .replace('billing_address_', '')
    const isNotCleaned =
      key.startsWith('shipping_address_') || key.startsWith('billing_address_')
    if (isNotCleaned) {
      // @ts-expect-error type error
      address[keyCleaned] = address[key]
      // @ts-expect-error type error
      delete address[key]
    }
  })
  return address
}
