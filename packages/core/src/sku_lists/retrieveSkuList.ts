import {
  type QueryParamsRetrieve,
  type SkuList,
  sku_lists,
} from "@commercelayer/sdk"
import { getSdk } from "#sdk"
import type { RequestConfig } from "#types"

interface RetrieveSkuList extends RequestConfig {
  id: string
  params?: QueryParamsRetrieve<SkuList>
}

/**
 * Retrieve a SKU list by ID, optionally including its skus
 *
 * @param {string} accessToken - The access token to use for authentication.
 * @param {string} id - The ID of the SKU list resource to retrieve.
 * @param {QueryParamsRetrieve<SkuList>} params - Optional query parameters for the request.
 * @returns {Promise<SkuList>} - The retrieved SKU list resource.
 */
export async function retrieveSkuList({
  accessToken,
  id,
  params,
}: RetrieveSkuList): Promise<SkuList> {
  getSdk({ accessToken })
  return await sku_lists.retrieve(id, params)
}
