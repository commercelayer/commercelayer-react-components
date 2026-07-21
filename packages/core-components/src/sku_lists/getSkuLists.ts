import {
  type ListResponse,
  type QueryParamsList,
  type SkuList,
  sku_lists,
} from "@commercelayer/sdk"
import { getSdk } from "#sdk"
import type { RequestConfig } from "#types"

interface GetSkuLists extends RequestConfig {
  params?: QueryParamsList<SkuList>
}

/**
 * Get a list of SKU lists
 *
 * @param {string} accessToken - The access token to use for authentication.
 * @param {QueryParamsList<SkuList>} params - Optional query parameters for the request.
 * @returns {Promise<ListResponse<SkuList>>} - A promise that resolves to a list of SKU list resources.
 */
export async function getSkuLists({
  accessToken,
  params,
  interceptors,
}: GetSkuLists): Promise<ListResponse<SkuList>> {
  getSdk({ accessToken, interceptors })
  return await sku_lists.list(params)
}
