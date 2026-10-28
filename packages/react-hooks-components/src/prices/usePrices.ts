import {
  fetchInChunks,
  getPrices,
  type InterceptorManager,
  type Price,
  type PriceUpdate,
  retrievePrice,
  updatePrice,
} from "@commercelayer/core-components"
import { useCallback, useEffect, useState, useSyncExternalStore } from "react"
import useSWR, { type KeyedMutator } from "swr"
import {
  EMPTY,
  getSnapshot,
  registerSku as storeRegisterSku,
  unregisterSku as storeUnregisterSku,
  subscribe,
} from "./pricesBatchStore"

/** Stable empty array returned when SWR has no data yet — prevents new reference on every render. */
const EMPTY_PRICES: Price[] = []

interface UsePricesReturn {
  prices: Price[]
  error: string | null
  isLoading: boolean
  isValidating: boolean
  action: UseAction
  fetchPrices: (params?: Parameters<typeof getPrices>[0]["params"]) => void
  /** Register a SKU code for batched fetching. Triggers a debounced batched request (one per 25 codes). */
  registerSku: (code: string) => void
  /** Unregister a SKU code previously added via `registerSku`. */
  unregisterSku: (code: string) => void
  retrievePrice: (id: string) => Promise<Price | undefined>
  updatePrice: (resource: PriceUpdate) => Promise<Price | undefined>
  clearPrices: () => void
  clearError: () => void
  mutate: KeyedMutator<Price[]>
}

type UseAction = "get" | "retrieve" | "update" | null

/**
 * Custom hook for managing Commerce Layer prices with SWR caching.
 *
 * Includes automatic batching support via `registerSku` / `unregisterSku`:
 * multiple calls within 50 ms are collapsed into one batch using a module-level
 * store and `useSyncExternalStore`. All hook instances sharing the same
 * `accessToken` hit the same SWR cache key, so the batch is fetched once, with one
 * request per 25 codes.
 *
 * @param accessToken - Commerce Layer API access token
 * @param interceptors - Optional SDK interceptors for request/response customization
 * @returns Object containing prices data, loading states, and action methods
 */
export function usePrices(accessToken: string, interceptors?: InterceptorManager): UsePricesReturn {
  const [fetchParams, setFetchParams] = useState<Parameters<typeof getPrices>[0]["params"]>()
  const [shouldFetch, setShouldFetch] = useState(false)
  /** Codes of the standalone batch, or null when the last fetch was a manual one. */
  const [batchCodes, setBatchCodes] = useState<readonly string[] | null>(null)
  const [action, setAction] = useState<UseAction>(null)

  // Subscribe to the module-level batch store for this access token.
  // All usePrices instances with the same token share the same store entry.
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

  const { data, error, isLoading, isValidating, mutate } = useSWR<Price[]>(
    shouldFetch && accessToken
      ? batchCodes != null
        ? ["prices", "batch", accessToken, batchCodes]
        : ["prices", "get", accessToken, fetchParams]
      : null,
    async (): Promise<Price[]> =>
      batchCodes != null
        ? fetchInChunks(batchCodes, (codes, pageSize) =>
            getPrices({
              accessToken,
              params: { filters: { sku_code_in: codes.join(",") }, pageSize },
              interceptors,
            })
          )
        : getPrices({ accessToken, params: fetchParams, interceptors }),
    { revalidateOnFocus: false, revalidateOnReconnect: false }
  )

  const fetchPrices = useCallback((newParams?: Parameters<typeof getPrices>[0]["params"]) => {
    setBatchCodes(null)
    setFetchParams(newParams)
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

  const handleRetrievePrice = useCallback(
    async (id: string): Promise<Price | undefined> => {
      if (!id) throw new Error("Price ID is required for retrieve")
      setAction("retrieve")
      return retrievePrice({ accessToken, id, interceptors })
    },
    [accessToken, interceptors]
  )

  const handleUpdatePrice = useCallback(
    async (resource: PriceUpdate): Promise<Price | undefined> => {
      if (!resource?.id) throw new Error("Price resource ID is required for update")
      setAction("update")
      const result = await updatePrice({ accessToken, resource, interceptors })
      await mutate(
        (current) => current?.map((p: Price) => (p.id === result.id ? result : p)) ?? [result],
        { revalidate: false }
      )
      return result
    },
    [accessToken, mutate, interceptors]
  )

  const clearPrices = useCallback(() => {
    setShouldFetch(false)
    setAction(null)
    // c8 ignore start
    mutate(undefined, false).catch(() => {})
    // c8 ignore end
  }, [mutate])

  const clearError = useCallback(() => mutate(data, false), [mutate, data])

  return {
    prices: data ?? EMPTY_PRICES,
    error: error?.message ?? null,
    isLoading,
    isValidating,
    action,
    fetchPrices,
    registerSku,
    unregisterSku,
    retrievePrice: handleRetrievePrice,
    updatePrice: handleUpdatePrice,
    clearPrices,
    clearError,
    mutate,
  }
}
