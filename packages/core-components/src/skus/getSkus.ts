import {
  type ListResponse,
  type QueryParamsList,
  type ResourcesConfig,
  type Sku,
  skus,
} from "@commercelayer/sdk"
import { getSdk } from "#sdk"
import type { RequestConfig } from "#types"

interface GetSkus extends RequestConfig {
  params?: QueryParamsList<Sku>
  options?: ResourcesConfig
}

type GetSkusParams = GetSkus

/**
 * Get a list of SKUs
 *
 * @param {string} accessToken - The access token to use for authentication.
 * @param {QueryParamsList<Sku>} params - Optional query parameters for the request.
 * @param {ResourcesConfig} options - Optional request configuration.
 * @returns {Promise<ListResponse<Sku>>} - A promise that resolves to a list of SKU resources.
 */
export async function getSkus({
  accessToken,
  params,
  options,
  interceptors,
}: GetSkusParams): Promise<ListResponse<Sku>> {
  getSdk({ accessToken, interceptors })
  return await skus.list(params, options)
}
