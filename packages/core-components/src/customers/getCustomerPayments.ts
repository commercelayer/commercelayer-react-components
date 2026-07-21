import { getSdk } from "#sdk"
import type { RequestConfig } from "#types"
import type { CustomerPaymentSource, ListResponse, QueryPageSize } from "./types"

interface GetCustomerPaymentsParams extends Pick<RequestConfig, "accessToken" | "interceptors"> {
  pageSize?: QueryPageSize
  pageNumber?: number
}

/**
 * Retrieve customer payment sources.
 */
export async function getCustomerPayments({
  accessToken,
  interceptors,
  pageSize = 10,
  pageNumber = 1,
}: GetCustomerPaymentsParams): Promise<ListResponse<CustomerPaymentSource>> {
  const sdk = getSdk({ accessToken, interceptors })

  return await sdk.customer_payment_sources.list({
    include: ["payment_source"],
    sort: { updated_at: "desc" },
    pageNumber,
    pageSize,
  })
}
