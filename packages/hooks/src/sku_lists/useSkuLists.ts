import {
  getSkuLists,
  type InterceptorManager,
  retrieveSkuList,
  type SkuList,
} from "@commercelayer/core"
import type { QueryParamsList, QueryParamsRetrieve } from "@commercelayer/sdk"
import { useCallback, useState } from "react"
import useSWR, { type KeyedMutator } from "swr"

interface UseSkuListsReturn {
  skuLists: SkuList[]
  error: string | null
  isLoading: boolean
  isValidating: boolean
  fetchSkuLists: (params?: QueryParamsList<SkuList>) => void
  retrieveSkuList: (
    id: string,
    params?: QueryParamsRetrieve<SkuList>
  ) => Promise<SkuList | undefined>
  clearSkuLists: () => void
  mutate: KeyedMutator<SkuList[]>
}

/**
 * Custom hook for managing Commerce Layer SKU lists with SWR caching.
 * Provides methods to fetch and retrieve SKU lists.
 *
 * @param accessToken - Commerce Layer API access token
 * @returns Object containing SKU lists data, loading states, and action methods
 */
export function useSkuLists(
  accessToken: string,
  interceptors?: InterceptorManager
): UseSkuListsReturn {
  const [params, setParams] = useState<QueryParamsList<SkuList>>()
  const [shouldFetch, setShouldFetch] = useState(false)

  const { data, error, isLoading, isValidating, mutate } = useSWR<SkuList[]>(
    shouldFetch && accessToken ? ["sku_lists", "get", accessToken, params] : null,
    async (): Promise<SkuList[]> => {
      const result = await getSkuLists({ accessToken, params, interceptors })
      return result
    },
    {
      revalidateOnFocus: false,
      revalidateOnReconnect: false,
    }
  )

  const fetchSkuLists = useCallback((newParams?: QueryParamsList<SkuList>) => {
    setParams(newParams)
    setShouldFetch(true)
  }, [])

  const handleRetrieveSkuList = useCallback(
    async (id: string, params?: QueryParamsRetrieve<SkuList>): Promise<SkuList | undefined> => {
      if (!id) throw new Error("SKU list ID is required for retrieve")
      return await retrieveSkuList({ accessToken, id, params, interceptors })
    },
    [accessToken, interceptors]
  )

  const clearSkuLists = useCallback(() => {
    setShouldFetch(false)
    // c8 ignore start
    mutate(undefined, false)?.catch(() => {
      // cache may be destroyed (e.g. isolated SWRConfig in tests)
    })
    // c8 ignore end
  }, [mutate])

  return {
    skuLists: data ?? [],
    error: error?.message ?? null,
    isLoading,
    isValidating,
    fetchSkuLists,
    retrieveSkuList: handleRetrieveSkuList,
    clearSkuLists,
    mutate,
  }
}
