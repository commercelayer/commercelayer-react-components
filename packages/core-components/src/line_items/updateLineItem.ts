import type { LineItem } from "@commercelayer/sdk"
import { getSdk } from "#sdk"
import type { RequestConfig } from "#types"

interface UpdateLineItemParams extends Pick<RequestConfig, "accessToken" | "interceptors"> {
  lineItemId: string
  quantity?: number
  hasExternalPrice?: boolean
}

/**
 * Update a line item's quantity and/or external price flag.
 *
 * @param {string} accessToken - The access token to use for authentication.
 * @param {string} lineItemId - The ID of the line item to update.
 * @param {number} quantity - The new quantity for the line item.
 * @param {boolean} hasExternalPrice - Whether to use an external price for the line item.
 * @returns {Promise<LineItem>} - The updated line item resource.
 */
export async function updateLineItem({
  accessToken,
  interceptors,
  lineItemId,
  quantity,
  hasExternalPrice,
}: UpdateLineItemParams): Promise<LineItem> {
  const sdk = getSdk({ accessToken, interceptors })
  return await sdk.line_items.update({
    id: lineItemId,
    quantity,
    _external_price: hasExternalPrice,
  })
}
