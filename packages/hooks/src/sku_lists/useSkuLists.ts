import {
  getSkuLists,
  retrieveSkuList,
  type SkuList,
} from "@commercelayer/core"
import { useCallback, useState } from "react"
import useSWR, { type KeyedMutator } from "swr"
import type { QueryParamsList, QueryParamsRetrieve } from "@commercelayer/sdk"

interface UseSkuListsReturn {
  skuLists: SkuList[]
  error: string | null
  isLoading: boolean
  isValidating: boolean
  fetchSkuLists: (params?: QueryParamsList<SkuList>) => void
  retrieveSkuList: (
    id: string,
    params?: QueryParamsRetrieve<SkuList>,
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
export function useSkuLists(accessToken: string): UseSkuListsReturn {
  const [params, setParams] = useState<QueryParamsList<SkuList>>()
  const [shouldFetch, setShouldFetch] = useState(false)

  const { data, error, isLoading, isValidating, mutate } = useSWR<SkuList[]>(
    shouldFetch && accessToken
      ? ["sku_lists", "get", accessToken, params]
      : null,
    async (): Promise<SkuList[]> => {
      const result = await getSkuLists({ accessToken, params })
      return result
    },
    {
      revalidateOnFocus: false,
      revalidateOnReconnect: false,
    },
  )

  const fetchSkuLists = useCallback(
    (newParams?: QueryParamsList<SkuList>) => {
      setParams(newParams)
      setShouldFetch(true)
    },
    [],
  )

  const handleRetrieveSkuList = useCallback(
    async (
      id: string,
      params?: QueryParamsRetrieve<SkuList>,
    ): Promise<SkuList | undefined> => {
      if (!id) throw new Error("SKU list ID is required for retrieve")
      return await retrieveSkuList({ accessToken, id, params })
    },
    [accessToken],
  )

  const clearSkuLists = useCallback(() => {
    setShouldFetch(false)
    mutate(undefined, false)?.catch(() => {
      // cache may be destroyed (e.g. isolated SWRConfig in tests)
    })
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
