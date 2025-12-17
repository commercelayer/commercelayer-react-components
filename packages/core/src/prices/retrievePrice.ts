import {
  type Price,
  prices,
  type QueryParamsRetrieve,
} from "@commercelayer/sdk"
import { getSdk } from "#sdk"
import type { RequestConfig } from "#types"

interface RetrievePrice extends RequestConfig {
  id: string
  params?: QueryParamsRetrieve<Price>
}

type RetrievePriceParams = RetrievePrice & QueryParamsRetrieve<Price>

/**
 * Retrieve a price
 *
 * @param {string} accessToken - The access token to use for authentication.
 * @param {string} id - The ID of the price resource to retrieve.
 * @param {QueryParamsRetrieve<Price>} params - Optional query parameters for the request.
 * @param {RequestConfig} options - Optional request configuration.
 * @returns {Promise<Price>} - The retrieved price resource.
 */
export async function retrievePrice({
  accessToken,
  id,
  params,
  options,
}: RetrievePriceParams): Promise<Price> {
  getSdk({ accessToken })
  return await prices.retrieve(id, params, options)
}
