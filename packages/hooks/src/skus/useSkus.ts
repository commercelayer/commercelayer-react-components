import {
  getSkus,
  retrieveSku,
  type Sku,
  type SkuUpdate,
  updateSku,
} from "@commercelayer/core"
import { useCallback, useEffect, useRef, useState } from "react"
import useSWR from "swr"

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
  mutate: () => void
}

type UseAction = "get" | "retrieve" | "update" | null

/**
 * Custom hook for managing Commerce Layer SKUs with SWR caching.
 * Provides methods to fetch, retrieve, update, and clear SKUs.
 *
 * @param accessToken - Commerce Layer API access token
 * @returns Object containing SKUs data, loading states, and action methods
 *
 * @example
 * ```typescript
 * const { skus, fetchSkus, updateSku } = useSkus(accessToken);
 *
 * // Fetch SKUs with filters
 * fetchSkus({ filters: { code_start: 'SHIRT' } });
 *
 * // Update a specific SKU
 * await updateSku({ id: 'sku_123', reference: 'my-ref' });
 * ```
 */
export function useSkus(accessToken: string): UseSkusReturn {
  const [params, setParams] =
    useState<Parameters<typeof getSkus>[0]["params"]>()
  const [shouldFetch, setShouldFetch] = useState(false)
  const [action, setAction] = useState<UseAction>(null)
  const [skuId, setSkuId] = useState<string | undefined>()
  const [skuResource, setSkuResource] = useState<SkuUpdate | undefined>()
  const dataRef = useRef<Sku[] | undefined>(undefined)

  const { data, error, isLoading, isValidating, mutate } = useSWR<Sku[]>(
    shouldFetch && accessToken && action
      ? ["skus", action, accessToken, params, skuId, skuResource]
      : null,
    async (): Promise<Sku[]> => {
      switch (action) {
        case "get":
          return await getSkus({
            accessToken,
            params,
          })
        case "retrieve": {
          if (skuId == null) return []
          return [await retrieveSku({ accessToken, id: skuId })]
        }
        case "update": {
          if (skuResource == null) return []
          const updatedSku = await updateSku({
            accessToken,
            resource: skuResource,
          })
          const currentData = dataRef.current
          return currentData
            ? currentData.map((s: Sku) =>
                s.id === updatedSku.id ? updatedSku : s,
              )
            : [updatedSku]
        }
        // The fetcher only runs when action is non-null (SWR key guard), so this default is unreachable
        /* v8 ignore next 4 */
        default:
          return await getSkus({
            accessToken,
            params,
          })
      }
    },
    {
      revalidateOnFocus: false,
      revalidateOnReconnect: false,
    },
  )

  useEffect(() => {
    if (action === "get" && data !== undefined) {
      dataRef.current = data
    }
  }, [data, action])

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
      setSkuId(id)
      setAction("retrieve")
      setShouldFetch(true)
      await mutate()
      return data?.[0]
    },
    [mutate, data],
  )

  const handleUpdateSku = useCallback(
    async (resource: SkuUpdate): Promise<Sku | undefined> => {
      if (!resource?.id)
        throw new Error("SKU resource ID is required for update")
      setSkuResource(resource)
      setAction("update")
      setShouldFetch(true)
      await mutate()
      return data?.find((s: Sku) => s.id === resource.id)
    },
    [mutate, data],
  )

  const clearSkus = useCallback(() => {
    setShouldFetch(false)
    setAction(null)
    setSkuId(undefined)
    setSkuResource(undefined)
    mutate(undefined, false)
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
