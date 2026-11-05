import {
  fetchInChunks,
  getSkus,
  type InterceptorManager,
  retrieveSku,
  type Sku,
  type SkuUpdate,
  updateSku,
} from "@commercelayer/core-components"
import { useCallback, useEffect, useState, useSyncExternalStore } from "react"
import useSWR, { type KeyedMutator } from "swr"
import {
  EMPTY,
  getSnapshot,
  registerSku as storeRegisterSku,
  unregisterSku as storeUnregisterSku,
  subscribe,
} from "./skusBatchStore"

/** Stable empty array returned when SWR has no data yet — prevents new reference on every render. */
const EMPTY_SKUS: Sku[] = []

interface UseSkusReturn {
  skus: Sku[]
  error: string | null
  isLoading: boolean
  isValidating: boolean
  action: UseAction
  fetchSkus: (params?: Parameters<typeof getSkus>[0]["params"]) => void
  /** Register a SKU code for batched fetching. Triggers a debounced batched request (one per 25 codes). */
  registerSku: (code: string) => void
  /** Unregister a SKU code previously added via `registerSku`. */
  unregisterSku: (code: string) => void
  retrieveSku: (id: string) => Promise<Sku | undefined>
  updateSku: (resource: SkuUpdate) => Promise<Sku | undefined>
  clearSkus: () => void
  clearError: () => void
  mutate: KeyedMutator<Sku[]>
}

type UseAction = "get" | "retrieve" | "update" | null

/**
 * Custom hook for managing Commerce Layer SKUs with SWR caching.
 *
 * Includes automatic batching support via `registerSku` / `unregisterSku`:
 * multiple calls within 50 ms are collapsed into one batch using a module-level
 * store and `useSyncExternalStore`. All hook instances sharing the same
 * `accessToken` hit the same SWR cache key, so the batch is fetched once, with one
 * request per 25 codes.
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
export function useSkus(accessToken: string, interceptors?: InterceptorManager): UseSkusReturn {
  const [params, setParams] = useState<Parameters<typeof getSkus>[0]["params"]>()
  const [shouldFetch, setShouldFetch] = useState(false)
  /** Codes of the standalone batch, or null when the last fetch was a manual one. */
  const [batchCodes, setBatchCodes] = useState<readonly string[] | null>(null)
  const [action, setAction] = useState<UseAction>(null)

  // Subscribe to the module-level batch store for this access token.
  // All useSkus instances with the same token share the same store entry.
  const stableSubscribe = useCallback(
    (listener: () => void) => subscribe(accessToken, listener),
    [accessToken]
  )
  const stableSnapshot = useCallback(() => getSnapshot(accessToken), [accessToken])
  const skuCodesList = useSyncExternalStore(
    stableSubscribe,
    stableSnapshot,
    // c8 ignore next — server snapshot only used during SSR hydration
    () => EMPTY
  )

  const { data, error, isLoading, isValidating, mutate } = useSWR<Sku[]>(
    shouldFetch && accessToken
      ? batchCodes != null
        ? ["skus", "batch", accessToken, batchCodes]
        : ["skus", "get", accessToken, params]
      : null,
    async (): Promise<Sku[]> => {
      if (batchCodes != null) {
        return await fetchInChunks(batchCodes, (codes, pageSize) =>
          getSkus({
            accessToken,
            params: { filters: { code_in: codes.join(",") }, pageSize },
            interceptors,
          })
        )
      }
      return await getSkus({ accessToken, params, interceptors })
    },
    {
      revalidateOnFocus: false,
      revalidateOnReconnect: false,
    }
  )

  const fetchSkus = useCallback((newParams?: Parameters<typeof getSkus>[0]["params"]) => {
    setBatchCodes(null)
    setParams(newParams)
    setShouldFetch(true)
    setAction("get")
  }, [])

  // Auto-fetch whenever the batch store snapshot changes (new SKU codes registered).
  // All instances with the same token share the same snapshot, hence the same
  // SWR key — SWR deduplicates to one request per chunk of codes.
  useEffect(() => {
    if (skuCodesList.length === 0 || !accessToken) return
    setBatchCodes(skuCodesList)
    setShouldFetch(true)
    setAction("get")
  }, [skuCodesList, accessToken])

  const registerSku = useCallback(
    (code: string) => storeRegisterSku(accessToken, code),
    [accessToken]
  )

  const unregisterSku = useCallback(
    (code: string) => storeUnregisterSku(accessToken, code),
    [accessToken]
  )

  const handleRetrieveSku = useCallback(
    async (id: string): Promise<Sku | undefined> => {
      if (!id) throw new Error("SKU ID is required for retrieve")
      setAction("retrieve")
      const result = await retrieveSku({ accessToken, id, interceptors })
      return result
    },
    [accessToken, interceptors]
  )

  const handleUpdateSku = useCallback(
    async (resource: SkuUpdate): Promise<Sku | undefined> => {
      if (!resource?.id) throw new Error("SKU resource ID is required for update")
      setAction("update")
      const result = await updateSku({ accessToken, resource, interceptors })
      await mutate(
        (current) => current?.map((s: Sku) => (s.id === result.id ? result : s)) ?? [result],
        { revalidate: false }
      )
      return result
    },
    [accessToken, mutate, interceptors]
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
    skus: data ?? EMPTY_SKUS,
    error: error?.message ?? null,
    isLoading,
    isValidating,
    action,
    fetchSkus,
    registerSku,
    unregisterSku,
    retrieveSku: handleRetrieveSku,
    updateSku: handleUpdateSku,
    clearSkus,
    clearError,
    mutate,
  }
}
