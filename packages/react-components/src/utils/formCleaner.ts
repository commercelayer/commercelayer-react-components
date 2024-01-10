/* eslint-disable @typescript-eslint/no-dynamic-delete */
import { type AddressSchema } from '#reducers/AddressReducer'

export function formCleaner(address: AddressSchema): AddressSchema {
  Object.keys(address).forEach((key) => {
    const isNotCleaned =
      key.startsWith('shipping_address_') || key.startsWith('billing_address_')
    if (isNotCleaned) {
      // @ts-expect-error type error
      delete address[key]
    }
  })
  return address
}
