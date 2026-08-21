import type { LineItem } from "@commercelayer/sdk"
import { getSdk } from "#sdk"
import type { RequestConfig } from "#types"

interface GetLineItemsParams extends Pick<RequestConfig, "accessToken" | "interceptors"> {
  orderId: string
}

/**
 * Retrieve all line items for a given order.
 *
 * Fetches the order with the necessary includes to fully populate
 * line items, their options and the associated item resource.
 *
 * @param {string} accessToken - The access token to use for authentication.
 * @param {string} orderId - The ID of the order whose line items to retrieve.
 * @returns {Promise<LineItem[]>} - The list of line item resources.
 */
export async function getLineItems({
  accessToken,
  interceptors,
  orderId,
}: GetLineItemsParams): Promise<LineItem[]> {
  const sdk = getSdk({ accessToken, interceptors })
  const order = await sdk.orders.retrieve(orderId, {
    include: ["line_items", "line_items.line_item_options.sku_option", "line_items.item"],
    fields: { orders: ["line_items"] },
  })
  return order.line_items ?? []
}
