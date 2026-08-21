import type { QueryParamsRetrieve, Sku } from "@commercelayer/sdk"
import { getSdk } from "#sdk"
import type { RequestConfig } from "#types"

interface RetrieveSku extends RequestConfig {
  id: string
  params?: QueryParamsRetrieve<Sku>
}

type RetrieveSkuParams = RetrieveSku & QueryParamsRetrieve<Sku>

/**
 * Retrieve a SKU
 *
 * @param {string} accessToken - The access token to use for authentication.
 * @param {string} id - The ID of the SKU resource to retrieve.
 * @param {QueryParamsRetrieve<Sku>} params - Optional query parameters for the request.
 * @param {RequestConfig} options - Optional request configuration.
 * @returns {Promise<Sku>} - The retrieved SKU resource.
 */
export async function retrieveSku({
  accessToken,
  id,
  params,
  options,
  interceptors,
}: RetrieveSkuParams): Promise<Sku> {
  const sdk = getSdk({ accessToken, interceptors })
  return await sdk.skus.retrieve(id, params, options)
}
