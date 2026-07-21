import type { Order, OrderUpdate, QueryParamsRetrieve } from "@commercelayer/sdk"
import { getSdk } from "#sdk"
import type { RequestConfig } from "#types"
import { retrieveOrder } from "./retrieveOrder"

interface UpdateOrderParams extends Pick<RequestConfig, "accessToken" | "interceptors"> {
  id: string
  attributes: Omit<OrderUpdate, "id">
  retrieveParams?: QueryParamsRetrieve<Order>
}

/**
 * Update an order by ID and return the refreshed resource.
 *
 * Updates the order attributes via SDK then re-retrieves it so the caller
 * always gets a fully populated `Order` back (the update response from the
 * API may omit attributes that were not changed).
 *
 * @param {string} accessToken - The access token to use for authentication.
 * @param {string} id - The order ID to update.
 * @param {Omit<OrderUpdate, "id">} attributes - Attributes to update on the order.
 * @param {QueryParamsRetrieve<Order>} retrieveParams - Optional params used when re-fetching.
 * @returns {Promise<Order>} - The updated and re-fetched order resource.
 */
export async function updateOrder({
  accessToken,
  interceptors,
  id,
  attributes,
  retrieveParams,
}: UpdateOrderParams): Promise<Order> {
  const sdk = getSdk({ accessToken, interceptors })
  await sdk.orders.update({ ...attributes, id })
  return await retrieveOrder({ accessToken, interceptors, id, params: retrieveParams })
}
