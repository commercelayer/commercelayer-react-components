import { PlaceOrderOptions } from '#reducers/PlaceOrderReducer'
import {
  getSaveBillingAddressToAddressBook,
  getSavePaymentSourceToCustomerWallet,
  getSaveShippingAddressToAddressBook,
} from './localStorage'

export function saveToWallet(options: PlaceOrderOptions): boolean {
  return (
    getSavePaymentSourceToCustomerWallet() ||
    'savePaymentSourceToCustomerWallet' in options
  )
}
export function saveBillingAddress(options: PlaceOrderOptions): boolean {
  return (
    getSaveBillingAddressToAddressBook() ||
    'saveBillingAddressToCustomerAddressBook' in options
  )
}
export function saveShippingAddress(options: PlaceOrderOptions): boolean {
  return (
    getSaveShippingAddressToAddressBook() ||
    'saveShippingAddressToCustomerAddressBook' in options
  )
}
