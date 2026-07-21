import { getSdk } from "#sdk"
import type { RequestConfig } from "#types"
import { getCustomerOrders } from "./getCustomerOrders"
import { getCustomerSubscriptions } from "./getCustomerSubscriptions"
import type { QueryPageSize } from "./types"

interface SetResourceTriggerParams extends Pick<RequestConfig, "accessToken" | "interceptors"> {
  resource: "orders" | "order_subscriptions"
  attribute: string
  id: string
  customerId?: string
  pageSize?: QueryPageSize
  pageNumber?: number
  reloadList?: boolean
}

/**
 * Trigger a boolean attribute on an order or order subscription.
 */
export async function setResourceTrigger({
  accessToken,
  interceptors,
  resource,
  attribute,
  id,
  customerId,
  pageSize = 10,
  pageNumber = 1,
  reloadList = false,
}: SetResourceTriggerParams): Promise<boolean> {
  const sdk = getSdk({ accessToken, interceptors })
  const response = await sdk[resource].update({ id, [attribute]: true })

  if (reloadList && customerId != null && response != null) {
    if (resource === "orders") {
      await getCustomerOrders({
        accessToken,
        interceptors,
        customerId,
        pageSize,
        pageNumber,
      })
    } else {
      await getCustomerSubscriptions({
        accessToken,
        interceptors,
        customerId,
        pageSize,
        pageNumber,
      })
    }
  }

  return response != null
}
