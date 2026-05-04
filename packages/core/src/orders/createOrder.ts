import type { Order, OrderCreate } from "@commercelayer/sdk"
import { orders } from "@commercelayer/sdk"
import { getSdk } from "#sdk"
import type { BaseMetadataObject, RequestConfig } from "#types"

interface CreateOrderParams extends Pick<RequestConfig, "accessToken" | "interceptors"> {
  metadata?: BaseMetadataObject
  attributes?: Omit<OrderCreate, "id">
}

/**
 * Create a new order.
 *
 * @param {string} accessToken - The access token to use for authentication.
 * @param {BaseMetadataObject} metadata - Optional metadata to attach to the order.
 * @param {Omit<OrderCreate, "id">} attributes - Optional attributes for the new order.
 * @returns {Promise<Order>} - The created order resource.
 */
export async function createOrder({
  accessToken,
  interceptors,
  metadata,
  attributes = {},
}: CreateOrderParams): Promise<Order> {
  getSdk({ accessToken, interceptors })
  return await orders.create({ metadata, ...attributes })
}
