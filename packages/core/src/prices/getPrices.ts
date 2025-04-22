import type {
  ListResponse,
  Price,
  QueryParamsList,
  ResourcesConfig,
} from "@commercelayer/sdk"
import { getSdk } from "#sdk"
import type { RequestConfig } from "#types"

interface GetPrices extends RequestConfig {
  params?: QueryParamsList<Price>
  options?: ResourcesConfig
}

type GetPricesParams = GetPrices

/**
 * Get a list of prices
 *
 * @param {string} accessToken - The access token to use for authentication.
 * @param {QueryParamsList<Price>} params - Optional query parameters for the request.
 * @param {ResourcesConfig} options - Optional request configuration.
 * @returns {Promise<ListResponse<Price>>} - A promise that resolves to a list of price resources.
 */
export async function getPrices({
  accessToken,
  params,
  options,
}: GetPricesParams): Promise<ListResponse<Price>> {
  const sdk = getSdk({ accessToken })
  return await sdk.prices.list(params, options)
}
