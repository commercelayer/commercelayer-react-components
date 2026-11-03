import type { getSdk } from "@commercelayer/core-components"
import {
  getSaveBillingAddressToAddressBook,
  getSavePaymentSourceToCustomerWallet,
  getSaveShippingAddressToAddressBook,
  setCustomerOrderParam,
} from "./localStorage"

export function saveToWallet(): boolean {
  return getSavePaymentSourceToCustomerWallet()
}
export function saveBillingAddress(): boolean {
  return getSaveBillingAddressToAddressBook()
}
export function saveShippingAddress(): boolean {
  return getSaveShippingAddressToAddressBook()
}

/**
 * Sends the address book flags the shopper checked, clearing each one as soon as the API
 * accepts it. The API saves the address right away, on a pending or a placed order alike,
 * so a flag sent twice could add it twice; and the flags live in localStorage, so clearing
 * them is what keeps a gateway redirect from sending them again on the return (#904).
 */
export async function saveAddressesToCustomerAddressBook(
  sdk: ReturnType<typeof getSdk>,
  orderId: string
): Promise<void> {
  if (saveBillingAddress()) {
    await sdk.orders.update({
      id: orderId,
      _save_billing_address_to_customer_address_book: true,
    })
    setCustomerOrderParam("_save_billing_address_to_customer_address_book", "false")
  }
  if (saveShippingAddress()) {
    await sdk.orders.update({
      id: orderId,
      _save_shipping_address_to_customer_address_book: true,
    })
    setCustomerOrderParam("_save_shipping_address_to_customer_address_book", "false")
  }
}
