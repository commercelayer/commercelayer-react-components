import {
  getSkus,
  type InterceptorManager,
  retrieveSku,
  type Sku,
  type SkuUpdate,
  updateSku,
} from "@commercelayer/core"
import { useCallback, useState } from "react"
import useSWR, { type KeyedMutator } from "swr"

interface UseSkusReturn {
  skus: Sku[]
  error: string | null
  isLoading: boolean
  isValidating: boolean
  action: UseAction
  fetchSkus: (params?: Parameters<typeof getSkus>[0]["params"]) => void
  retrieveSku: (id: string) => Promise<Sku | undefined>
  updateSku: (resource: SkuUpdate) => Promise<Sku | undefined>
  clearSkus: () => void
  clearError: () => void
  mutate: KeyedMutator<Sku[]>
}

type UseAction = "get" | "retrieve" | "update" | null

/**
 * Custom hook for managing Commerce Layer SKUs with SWR caching.
 * Provides methods to fetch, retrieve, update, and clear SKUs.
 *
 * @param accessToken - Commerce Layer API access token
 * @param interceptors - Optional SDK interceptors for request/response customization
 * @returns Object containing SKUs data, loading states, and action methods
 *
 * @example
 * ```typescript
 * const { skus, fetchSkus, updateSku } = useSkus(accessToken, {
 *   request: { onSuccess: (req) => { console.log(req); return req; } },
 * });
 * ```
 */
export function useSkus(
  accessToken: string,
  interceptors?: InterceptorManager,
): UseSkusReturn {
  const [params, setParams] =
    useState<Parameters<typeof getSkus>[0]["params"]>()
  const [shouldFetch, setShouldFetch] = useState(false)
  const [action, setAction] = useState<UseAction>(null)

  const { data, error, isLoading, isValidating, mutate } = useSWR<Sku[]>(
    shouldFetch && accessToken ? ["skus", "get", accessToken, params] : null,
    async (): Promise<Sku[]> => {
      return await getSkus({ accessToken, params, interceptors })
    },
    {
      revalidateOnFocus: false,
      revalidateOnReconnect: false,
    },
  )

  const fetchSkus = useCallback(
    (newParams?: Parameters<typeof getSkus>[0]["params"]) => {
      setParams(newParams)
      setShouldFetch(true)
      setAction("get")
    },
    [],
  )

  const handleRetrieveSku = useCallback(
    async (id: string): Promise<Sku | undefined> => {
      if (!id) throw new Error("SKU ID is required for retrieve")
      setAction("retrieve")
      const result = await retrieveSku({ accessToken, id, interceptors })
      return result
    },
    [accessToken, interceptors],
  )

  const handleUpdateSku = useCallback(
    async (resource: SkuUpdate): Promise<Sku | undefined> => {
      if (!resource?.id)
        throw new Error("SKU resource ID is required for update")
      setAction("update")
      const result = await updateSku({ accessToken, resource, interceptors })
      await mutate(
        (current) =>
          current?.map((s: Sku) => (s.id === result.id ? result : s)) ?? [
            result,
          ],
        { revalidate: false },
      )
      return result
    },
    [accessToken, mutate, interceptors],
  )

  const clearSkus = useCallback(() => {
    setShouldFetch(false)
    setAction(null)
    // c8 ignore start
    mutate(undefined, false)?.catch(() => {
      // cache may be destroyed (e.g. isolated SWRConfig in tests)
    })
    // c8 ignore end
  }, [mutate])

  const clearError = useCallback(() => {
    mutate(data, false)
  }, [mutate, data])

  return {
    skus: data ?? [],
    error: error?.message ?? null,
    isLoading,
    isValidating,
    action,
    fetchSkus,
    retrieveSku: handleRetrieveSku,
    updateSku: handleUpdateSku,
    clearSkus,
    clearError,
    mutate,
  }
}
