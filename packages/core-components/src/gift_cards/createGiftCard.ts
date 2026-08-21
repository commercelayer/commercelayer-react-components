import type { GiftCard, GiftCardCreate, QueryParamsRetrieve } from "@commercelayer/sdk"
import { getSdk } from "#sdk"
import type { RequestConfig } from "#types"

interface CreateGiftCardParams extends RequestConfig {
  resource: GiftCardCreate
  params?: QueryParamsRetrieve<GiftCard>
}

/**
 * Create a new gift card.
 *
 * @param {string} accessToken - The access token to use for authentication, must be an integration application.
 * @param {GiftCardCreate} resource - The gift card resource to create.
 * @param {QueryParamsRetrieve<GiftCard>} params - Optional query parameters for the request.
 * @returns {Promise<GiftCard>} - The created gift card resource.
 */
export async function createGiftCard({
  accessToken,
  resource,
  params,
  interceptors,
}: CreateGiftCardParams): Promise<GiftCard> {
  const sdk = getSdk({ accessToken, interceptors })
  return await sdk.gift_cards.create(resource, params)
}
