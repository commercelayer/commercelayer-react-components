import {
  getPrices,
  type Price,
  type PriceUpdate,
  retrievePrice,
  updatePrice,
} from "@commercelayer/core"
import { useCallback, useState } from "react"
import useSWR from "swr"


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
  mutate: () => void
}

type UseAction = "get" | "retrieve" | "update" | null

/**
 * Custom hook for managing Commerce Layer prices with SWR caching.
 * Provides methods to fetch, retrieve, update, and clear prices.
 * 
 * @param accessToken - Commerce Layer API access token
 * @returns Object containing prices data, loading states, and action methods
 * 
 * @example
 * ```typescript
 * const { prices, fetchPrices, updatePrice } = usePrices(accessToken);
 * 
 * // Fetch prices with filters
 * fetchPrices({ filters: { currency_code_eq: 'USD' } });
 * 
 * // Update a specific price
 * await updatePrice({ id: 'price_123', amount_cents: 1000 });
 * ```
 */
export function usePrices(accessToken: string): UsePricesReturn {
  const [params, setParams] =
    useState<Parameters<typeof getPrices>[0]["params"]>()
  const [shouldFetch, setShouldFetch] = useState(false)
  const [action, setAction] = useState<UseAction>(null)
  const [priceId, setPriceId] = useState<string | undefined>()
  const [priceResource, setPriceResource] = useState<PriceUpdate | undefined>()

  const { data, error, isLoading, isValidating, mutate } = useSWR<Price[]>(
    shouldFetch && accessToken && action
      ? ["prices", action, accessToken, params, priceId, priceResource]
      : null,
    async (): Promise<Price[]> => {
      switch (action) {
        case "get":
          return await getPrices({
            accessToken,
            params,
          })
        case "retrieve": {
          if (!priceId) throw new Error("Price ID is required for retrieve")
          return [await retrievePrice({ accessToken, id: priceId })]
        }
        case "update": {
          if (!priceResource)
            throw new Error("Price resource is required for update")
          const updatedPrice = await updatePrice({
            accessToken,
            resource: priceResource,
          })
          return data
            ? data.map((p: Price) =>
                p.id === updatedPrice.id ? updatedPrice : p,
              )
            : [updatedPrice]
        }
        default:
          return await getPrices({
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
      setPriceId(id)
      setAction("retrieve")
      setShouldFetch(true)
      // Wait for SWR to fetch
      await mutate()
      return data?.[0]
    },
    [mutate, data],
  )

  const handleUpdatePrice = useCallback(
    async (resource: PriceUpdate): Promise<Price | undefined> => {
      setPriceResource(resource)
      setAction("update")
      setShouldFetch(true)
      await mutate()
      return data?.find((p: Price) => p.id === resource.id)
    },
    [mutate, data],
  )

  const clearPrices = useCallback(() => {
    setShouldFetch(false)
    setAction(null)
    setPriceId(undefined)
    setPriceResource(undefined)
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
