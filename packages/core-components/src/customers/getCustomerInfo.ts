import { getSdk } from "#sdk"
import type { RequestConfig } from "#types"
import type { CustomerInfoData } from "./types"

interface GetCustomerInfoParams extends Pick<RequestConfig, "accessToken" | "interceptors"> {
  customerId: string
}

/**
 * Retrieve a customer and expose the normalized customer email.
 */
export async function getCustomerInfo({
  accessToken,
  interceptors,
  customerId,
}: GetCustomerInfoParams): Promise<CustomerInfoData> {
  const sdk = getSdk({ accessToken, interceptors })
  const customer = await sdk.customers.retrieve(customerId)

  return {
    customer,
    customerEmail: customer.email,
  }
}
