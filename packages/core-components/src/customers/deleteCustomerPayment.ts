import { getSdk } from "#sdk"
import type { RequestConfig } from "#types"

interface DeleteCustomerPaymentParams extends Pick<RequestConfig, "accessToken" | "interceptors"> {
  customerPaymentSourceId: string
}

/**
 * Delete a customer payment source.
 */
export async function deleteCustomerPayment({
  accessToken,
  interceptors,
  customerPaymentSourceId,
}: DeleteCustomerPaymentParams): Promise<void> {
  const sdk = getSdk({ accessToken, interceptors })
  await sdk.customer_payment_sources.delete(customerPaymentSourceId)
}
