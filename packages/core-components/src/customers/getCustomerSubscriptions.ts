import { getSdk } from "#sdk"
import type { RequestConfig } from "#types"
import type { ListResponse, Order, OrderSubscription, QueryPageSize, QuerySort } from "./types"

interface GetCustomerSubscriptionsParams
  extends Pick<RequestConfig, "accessToken" | "interceptors"> {
  customerId: string
  pageSize?: QueryPageSize
  pageNumber?: number
  sortBy?: QuerySort<Order>
  id?: string
}

/**
 * Retrieve customer subscriptions or the orders linked to a subscription.
 */
export async function getCustomerSubscriptions({
  accessToken,
  interceptors,
  customerId,
  pageSize = 10,
  pageNumber = 1,
  sortBy,
  id,
}: GetCustomerSubscriptionsParams): Promise<ListResponse<Order> | ListResponse<OrderSubscription>> {
  const sdk = getSdk({ accessToken, interceptors })

  if (id != null) {
    return await sdk.customers.orders(customerId, {
      filters: { order_subscription_id_eq: id },
      sort: { number: "desc" },
      include: ["authorizations"],
      pageSize,
      pageNumber,
    })
  }

  return await sdk.customers.order_subscriptions(customerId, {
    sort: (sortBy ?? { starts_at: "desc" }) as QuerySort<OrderSubscription>,
    pageSize,
    pageNumber,
  })
}
