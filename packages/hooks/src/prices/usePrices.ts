import {
  getPrices,
  type InterceptorManager,
  type Price,
  type PriceUpdate,
  retrievePrice,
  updatePrice,
} from "@commercelayer/core"
import { useCallback, useState } from "react"
import useSWR, { type KeyedMutator } from "swr"

interface UsePricesReturn {
  prices: Price[]
  error: string | null
  isLoading: boolean
  isValidating: boolean
  action: UseAction
  fetchPrices: (params?: Parameters<typeof getPrices>[0]["params"]) => void
  retrievePrice: (id: string) => Promise<Price | undefined>
  updatePrice: (resource: PriceUpdate) => Promise<Price | undefined>
  clearPrices: () => void
  clearError: () => void
  mutate: KeyedMutator<Price[]>
}

type UseAction = "get" | "retrieve" | "update" | null

/**
 * Custom hook for managing Commerce Layer prices with SWR caching.
 * Provides methods to fetch, retrieve, update, and clear prices.
 *
 * @param accessToken - Commerce Layer API access token
 * @param interceptors - Optional SDK interceptors for request/response customization
 * @returns Object containing prices data, loading states, and action methods
 */
export function usePrices(
  accessToken: string,
  interceptors?: InterceptorManager,
): UsePricesReturn {
  const [params, setParams] =
    useState<Parameters<typeof getPrices>[0]["params"]>()
  const [shouldFetch, setShouldFetch] = useState(false)
  const [action, setAction] = useState<UseAction>(null)

  const { data, error, isLoading, isValidating, mutate } = useSWR<Price[]>(
    shouldFetch && accessToken ? ["prices", "get", accessToken, params] : null,
    async (): Promise<Price[]> => {
      return await getPrices({ accessToken, params, interceptors })
    },
    {
      revalidateOnFocus: false,
      revalidateOnReconnect: false,
    },
  )

  const fetchPrices = useCallback(
    (newParams?: Parameters<typeof getPrices>[0]["params"]) => {
      setParams(newParams)
      setShouldFetch(true)
      setAction("get")
    },
    [],
  )

  const handleRetrievePrice = useCallback(
    async (id: string): Promise<Price | undefined> => {
      if (!id) throw new Error("Price ID is required for retrieve")
      setAction("retrieve")
      const result = await retrievePrice({ accessToken, id, interceptors })
      return result
    },
    [accessToken, interceptors],
  )

  const handleUpdatePrice = useCallback(
    async (resource: PriceUpdate): Promise<Price | undefined> => {
      if (!resource?.id)
        throw new Error("Price resource ID is required for update")
      setAction("update")
      const result = await updatePrice({ accessToken, resource, interceptors })
      await mutate(
        (current) =>
          current?.map((p: Price) => (p.id === result.id ? result : p)) ?? [
            result,
          ],
        { revalidate: false },
      )
      return result
    },
    [accessToken, mutate, interceptors],
  )

  const clearPrices = useCallback(() => {
    setShouldFetch(false)
    setAction(null)
    mutate(undefined, false)
  }, [mutate])

  const clearError = useCallback(() => {
    mutate(data, false)
  }, [mutate, data])

  return {
    prices: data ?? [],
    error: error?.message ?? null,
    isLoading,
    isValidating,
    action,
    fetchPrices,
    retrievePrice: handleRetrievePrice,
    updatePrice: handleUpdatePrice,
    clearPrices,
    clearError,
    mutate,
  }
}
