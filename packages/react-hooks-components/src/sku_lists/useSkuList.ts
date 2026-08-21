import {
  retrieveSkuList as coreRetrieveSkuList,
  type InterceptorManager,
  type SkuList,
} from "@commercelayer/core-components"
import type { QueryParamsRetrieve } from "@commercelayer/sdk"
import useSWR from "swr"

interface UseSkuListReturn {
  skuList: SkuList | undefined
  isLoading: boolean
}

/**
 * Fetches a single SKU list by ID using SWR for caching.
 * Used by the standalone `<SkuList>` component.
 */
export function useSkuList(
  id: string,
  accessToken: string,
  interceptors?: InterceptorManager,
  params?: QueryParamsRetrieve<SkuList>
): UseSkuListReturn {
  const { data, isLoading } = useSWR<SkuList>(
    id && accessToken ? ["sku_list", "retrieve", id, accessToken, params] : null,
    async () => coreRetrieveSkuList({ accessToken, id, params, interceptors }),
    {
      revalidateOnFocus: false,
      revalidateOnReconnect: false,
    }
  )

  return { skuList: data, isLoading }
}
