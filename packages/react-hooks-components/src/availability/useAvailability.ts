import {
  getSkuAvailability,
  type InterceptorManager,
  type SkuAvailability,
} from "@commercelayer/core-components"
import { useCallback, useState } from "react"
import useSWR, { type KeyedMutator } from "swr"

interface UseAvailabilityReturn {
  availability: SkuAvailability | null
  error: string | null
  isLoading: boolean
  isValidating: boolean
  fetchAvailability: (params: { skuCode?: string; skuId?: string }) => void
  clearAvailability: () => void
  mutate: KeyedMutator<SkuAvailability | null>
}

/**
 * Custom hook for fetching Commerce Layer SKU availability with SWR caching.
 * Returns inventory quantity and delivery lead time for a given SKU.
 *
 * @param accessToken - Commerce Layer API access token
 * @returns Object containing availability data, loading states, and action methods
 */
export function useAvailability(
  accessToken: string,
  interceptors?: InterceptorManager
): UseAvailabilityReturn {
  const [fetchParams, setFetchParams] = useState<{
    skuCode?: string
    skuId?: string
  } | null>(null)

  const { data, error, isLoading, isValidating, mutate } = useSWR<SkuAvailability | null>(
    fetchParams && accessToken
      ? ["availability", accessToken, fetchParams.skuCode, fetchParams.skuId]
      : null,
    async (): Promise<SkuAvailability | null> => {
      return await getSkuAvailability({
        accessToken,
        skuCode: fetchParams?.skuCode,
        skuId: fetchParams?.skuId,
        interceptors,
      })
    },
    {
      revalidateOnFocus: false,
      revalidateOnReconnect: false,
    }
  )

  const fetchAvailability = useCallback((params: { skuCode?: string; skuId?: string }) => {
    setFetchParams(params)
  }, [])

  const clearAvailability = useCallback(() => {
    setFetchParams(null)
    // c8 ignore start
    mutate(undefined, false)?.catch(() => {
      // cache may be destroyed (e.g. isolated SWRConfig in tests)
    })
    // c8 ignore end
  }, [mutate])

  return {
    availability: data ?? null,
    error: error?.message ?? null,
    isLoading,
    isValidating,
    fetchAvailability,
    clearAvailability,
    mutate,
  }
}
