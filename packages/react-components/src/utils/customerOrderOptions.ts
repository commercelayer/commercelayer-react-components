import {
  getSaveBillingAddressToAddressBook,
  getSavePaymentSourceToCustomerWallet,
  getSaveShippingAddressToAddressBook
} from './localStorage'

export function saveToWallet(): boolean {
  return getSavePaymentSourceToCustomerWallet()
}
export function saveBillingAddress(): boolean {
  return getSaveBillingAddressToAddressBook()
}
export function saveShippingAddress(): boolean {
  return getSaveShippingAddressToAddressBook()
}
