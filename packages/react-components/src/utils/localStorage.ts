export type GetLocalOrder = (key: string) => string | null

export const getLocalOrder: GetLocalOrder = (key) => {
  return localStorage.getItem(key)
}

export type SetLocalOrder = (key: string, value: string) => void

export const setLocalOrder: SetLocalOrder = (key, value) => {
  localStorage.setItem(key, value)
}

export type DeleteLocalOrder = (key: string) => void

export const deleteLocalOrder: DeleteLocalOrder = (key) => {
  localStorage.removeItem(key)
}

export const getSavePaymentSourceToCustomerWallet = (): boolean => {
  return (
    localStorage.getItem('_save_payment_source_to_customer_wallet') === 'true'
  )
}

export const getSaveBillingAddressToAddressBook = (): boolean => {
  return (
    localStorage.getItem('_save_billing_address_to_customer_address_book') ===
    'true'
  )
}

export const getSaveShippingAddressToAddressBook = (): boolean => {
  return (
    localStorage.getItem('_save_shipping_address_to_customer_address_book') ===
    'true'
  )
}

export type CustomerOrderParams =
  | '_save_payment_source_to_customer_wallet'
  | '_save_billing_address_to_customer_address_book'
  | '_save_shipping_address_to_customer_address_book'

export function setCustomerOrderParam<T extends CustomerOrderParams>(
  key: T,
  value: string
): void {
  setLocalOrder(key, value)
}
