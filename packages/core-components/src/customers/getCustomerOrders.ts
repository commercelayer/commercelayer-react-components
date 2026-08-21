import { getSdk } from "#sdk"
import type { RequestConfig } from "#types"
import type { ListResponse, Order, QueryPageSize, QuerySort } from "./types"

interface GetCustomerOrdersParams extends Pick<RequestConfig, "accessToken" | "interceptors"> {
  customerId: string
  pageSize?: QueryPageSize
  pageNumber?: number
  sortBy?: QuerySort<Order>
}

/**
 * Retrieve non-draft customer orders.
 */
export async function getCustomerOrders({
  accessToken,
  interceptors,
  customerId,
  pageSize = 10,
  pageNumber = 1,
  sortBy,
}: GetCustomerOrdersParams): Promise<ListResponse<Order>> {
  const sdk = getSdk({ accessToken, interceptors })

  return await sdk.customers.orders(customerId, {
    filters: { status_not_in: "draft,pending" },
    sort: sortBy ?? { number: "desc" },
    pageSize,
    pageNumber,
  })
}
