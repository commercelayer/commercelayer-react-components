export interface GetLocalOrder {
  (key: string): string | null
}

export const getLocalOrder: GetLocalOrder = (key) => {
  return localStorage.getItem(key)
}

export interface SetLocalOrder {
  (key: string, value: string): void
}

export const setLocalOrder: SetLocalOrder = (key, value) => {
  return localStorage.setItem(key, value)
}

export interface DeleteLocalOrder {
  (key: string): void
}

export const deleteLocalOrder: DeleteLocalOrder = (key) => {
  localStorage.removeItem(key)
}

export const getSavePaymentSourceToCustomerWallet = (): boolean => {
  return localStorage.getItem('savePaymentSourceToCustomerWallet') === 'true'
}

export const getSaveBillingAddressToAddressBook = (): boolean => {
  return (
    localStorage.getItem('saveBillingAddressToCustomerAddressBook') === 'true'
  )
}

export const getSaveShippingAddressToAddressBook = (): boolean => {
  return (
    localStorage.getItem('saveShippingAddressToCustomerAddressBook') === 'true'
  )
}

type CustomerOrderParams =
  | 'savePaymentSourceToCustomerWallet'
  | 'saveBillingAddressToCustomerAddressBook'
  | 'saveShippingAddressToCustomerAddressBook'

export function setCustomerOrderParam<T extends CustomerOrderParams>(
  key: T,
  value: string
): void {
  return setLocalOrder(key, value)
}
