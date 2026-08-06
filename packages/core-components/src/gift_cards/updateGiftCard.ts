import type { GiftCard, GiftCardUpdate, QueryParamsRetrieve } from "@commercelayer/sdk"
import { getSdk } from "#sdk"
import type { RequestConfig } from "#types"

interface UpdateGiftCardParams extends RequestConfig {
  resource: GiftCardUpdate
  params?: QueryParamsRetrieve<GiftCard>
}

/**
 * Update a gift card.
 *
 * @param {string} accessToken - The access token to use for authentication, must be an integration application.
 * @param {GiftCardUpdate} resource - The gift card resource to update.
 * @param {QueryParamsRetrieve<GiftCard>} params - Optional query parameters for the request.
 * @returns {Promise<GiftCard>} - The updated gift card resource.
 */
export async function updateGiftCard({
  accessToken,
  resource,
  params,
  interceptors,
}: UpdateGiftCardParams): Promise<GiftCard> {
  const sdk = getSdk({ accessToken, interceptors })
  return await sdk.gift_cards.update(resource, params)
}
