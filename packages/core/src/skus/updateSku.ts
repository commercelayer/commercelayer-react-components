import {
  type QueryParamsRetrieve,
  type Sku,
  type SkuUpdate,
  skus,
} from "@commercelayer/sdk"
import { getSdk } from "#sdk"
import type { RequestConfig } from "#types"

interface UpdateSku extends RequestConfig {
  resource: SkuUpdate
  params?: QueryParamsRetrieve<Sku>
}

type UpdateSkuParams = UpdateSku

/**
 * Update a SKU
 *
 * @param {string} accessToken - The access token to use for authentication, must be an integration application.
 * @param {SkuUpdate} resource - The SKU resource to update.
 * @param {QueryParamsRetrieve<Sku>} params - Optional query parameters for the request.
 * @param {RequestConfig} options - Optional request configuration.
 * @returns {Promise<Sku>} - The updated SKU resource.
 */
export async function updateSku({
  accessToken,
  resource,
  params,
  options,
  interceptors,
}: UpdateSkuParams): Promise<Sku> {
  getSdk({ accessToken, interceptors })
  return await skus.update(resource, params, options)
}
