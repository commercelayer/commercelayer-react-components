import {
  type GiftCard,
  gift_cards,
  type ListResponse,
  type QueryParamsList,
  type ResourcesConfig,
} from "@commercelayer/sdk"
import { getSdk } from "#sdk"
import type { RequestConfig } from "#types"

interface GetGiftCardsParams extends RequestConfig {
  params?: QueryParamsList<GiftCard>
  options?: ResourcesConfig
}

/**
 * Get a list of gift cards.
 *
 * @param {string} accessToken - The access token to use for authentication.
 * @param {QueryParamsList<GiftCard>} params - Optional query parameters for the request.
 * @param {ResourcesConfig} options - Optional request configuration.
 * @returns {Promise<ListResponse<GiftCard>>} - A promise that resolves to a list of gift card resources.
 */
export async function getGiftCards({
  accessToken,
  params,
  options,
  interceptors,
}: GetGiftCardsParams): Promise<ListResponse<GiftCard>> {
  getSdk({ accessToken, interceptors })
  return await gift_cards.list(params, options)
}
