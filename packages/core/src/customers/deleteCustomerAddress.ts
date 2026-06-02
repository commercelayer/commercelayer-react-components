import { getSdk } from "#sdk"
import type { RequestConfig } from "#types"

interface DeleteCustomerAddressParams extends Pick<RequestConfig, "accessToken" | "interceptors"> {
  customerAddressId: string
}

/**
 * Delete a customer address relationship.
 */
export async function deleteCustomerAddress({
  accessToken,
  interceptors,
  customerAddressId,
}: DeleteCustomerAddressParams): Promise<void> {
  const sdk = getSdk({ accessToken, interceptors })
  await sdk.customer_addresses.delete(customerAddressId)
}
