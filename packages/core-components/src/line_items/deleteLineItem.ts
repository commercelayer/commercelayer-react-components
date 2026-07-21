import { getSdk } from "#sdk"
import type { RequestConfig } from "#types"

interface DeleteLineItemParams extends Pick<RequestConfig, "accessToken" | "interceptors"> {
  lineItemId: string
}

/**
 * Delete a line item by ID.
 *
 * @param {string} accessToken - The access token to use for authentication.
 * @param {string} lineItemId - The ID of the line item to delete.
 * @returns {Promise<void>}
 */
export async function deleteLineItem({
  accessToken,
  interceptors,
  lineItemId,
}: DeleteLineItemParams): Promise<void> {
  const sdk = getSdk({ accessToken, interceptors })
  await sdk.line_items.delete(lineItemId)
}
