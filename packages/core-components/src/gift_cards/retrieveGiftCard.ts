import { type GiftCard, gift_cards, type QueryParamsRetrieve } from "@commercelayer/sdk"
import { getSdk } from "#sdk"
import type { RequestConfig } from "#types"

interface RetrieveGiftCardParams extends RequestConfig {
  id: string
  params?: QueryParamsRetrieve<GiftCard>
}

/**
 * Retrieve a gift card by ID.
 *
 * @param {string} accessToken - The access token to use for authentication.
 * @param {string} id - The ID of the gift card resource to retrieve.
 * @param {QueryParamsRetrieve<GiftCard>} params - Optional query parameters for the request.
 * @returns {Promise<GiftCard>} - The retrieved gift card resource.
 */
export async function retrieveGiftCard({
  accessToken,
  id,
  params,
  interceptors,
}: RetrieveGiftCardParams): Promise<GiftCard> {
  getSdk({ accessToken, interceptors })
  return await gift_cards.retrieve(id, params)
}
