import { PlaceOrderOptions } from '#reducers/PlaceOrderReducer'
import {
  getSaveBillingAddressToAddressBook,
  getSavePaymentSourceToCustomerWallet,
  getSaveShippingAddressToAddressBook,
} from './localStorage'

export function saveToWallet(options?: PlaceOrderOptions): boolean {
  return (
    getSavePaymentSourceToCustomerWallet() ||
    !!options?.savePaymentSourceToCustomerWallet
  )
}
export function saveBillingAddress(options?: PlaceOrderOptions): boolean {
  return (
    getSaveBillingAddressToAddressBook() ||
    !!options?.saveBillingAddressToCustomerAddressBook
  )
}
export function saveShippingAddress(options?: PlaceOrderOptions): boolean {
  return (
    getSaveShippingAddressToAddressBook() ||
    !!options?.saveShippingAddressToCustomerAddressBook
  )
}
