import type { CustomerPaymentSource, Order } from "./types"

interface GetCustomerPaymentSourcesParams {
  order?: Order
}

/**
 * Retrieve customer payment sources already available on an order payload.
 */
export function getCustomerPaymentSources({
  order,
}: GetCustomerPaymentSourcesParams = {}): CustomerPaymentSource[] | undefined {
  return order?.available_customer_payment_sources ?? undefined
}
