import type { Order, QueryParamsRetrieve } from "@commercelayer/sdk"
import { orders } from "@commercelayer/sdk"
import { getSdk } from "#sdk"
import type { RequestConfig } from "#types"

interface RetrieveOrderParams extends Pick<RequestConfig, "accessToken" | "interceptors"> {
  id: string
  params?: QueryParamsRetrieve<Order>
}

/**
 * Retrieve an order by ID.
 *
 * @param {string} accessToken - The access token to use for authentication.
 * @param {string} id - The order ID to retrieve.
 * @param {QueryParamsRetrieve<Order>} params - Optional query parameters (includes, fields, etc.).
 * @returns {Promise<Order>} - The retrieved order resource.
 */
export async function retrieveOrder({
  accessToken,
  interceptors,
  id,
  params,
}: RetrieveOrderParams): Promise<Order> {
  getSdk({ accessToken, interceptors })
  return await orders.retrieve(id, params)
}
