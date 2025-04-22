import type {
  Price,
  PriceUpdate,
  QueryParamsRetrieve,
} from "@commercelayer/sdk"
import { getSdk } from "#sdk"
import type { RequestConfig } from "#types"

interface UpdatePrice extends RequestConfig {
  resource: PriceUpdate
  params?: QueryParamsRetrieve<Price>
}

type UpdatePriceParams = UpdatePrice

/**
 * Update a price
 *
 * @param {string} accessToken - The access token to use for authentication, must be an integration application.
 * @param {PriceUpdate} resource - The price resource to update.
 * @param {QueryParamsRetrieve<Price>} params - Optional query parameters for the request.
 * @param {RequestConfig} options - Optional request configuration.
 * @returns {Promise<Price>} - The updated price resource.
 */
export async function updatePrice({
  accessToken,
  resource,
  params,
  options,
}: UpdatePriceParams): Promise<Price> {
  const sdk = getSdk({ accessToken })
  return await sdk.prices.update(resource, params, options)
}
