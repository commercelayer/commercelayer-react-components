import { getSdk } from "#sdk"
import type { RequestConfig } from "#types"

interface SaveCustomerUserParams extends Pick<RequestConfig, "accessToken" | "interceptors"> {
  customerEmail: string
  orderId: string
}

/**
 * Save a customer email on an order.
 */
export async function saveCustomerUser({
  accessToken,
  interceptors,
  customerEmail,
  orderId,
}: SaveCustomerUserParams): Promise<void> {
  const sdk = getSdk({ accessToken, interceptors })
  await sdk.orders.update({ id: orderId, customer_email: customerEmail })
}
