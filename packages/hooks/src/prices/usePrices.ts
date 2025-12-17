import { getPrices, type Price } from "@commercelayer/core"
import { useCallback, useState, useTransition } from "react"

interface UsePricesState {
  prices: Price[]
  error: string | null
}

interface UsePricesReturn extends UsePricesState {
  isPending: boolean
  fetchPrices: (params?: Parameters<typeof getPrices>[0]["params"]) => void
  clearPrices: () => void
  clearError: () => void
}

export function usePrices(accessToken: string): UsePricesReturn {
  const [isPending, startTransition] = useTransition()
  const [state, setState] = useState<UsePricesState>({
    prices: [],
    error: null,
  })

  const fetchPrices = useCallback(
    (params?: Parameters<typeof getPrices>[0]["params"]) => {
      setState((prev: UsePricesState) => ({ ...prev, error: null }))

      startTransition(async () => {
        try {
          const prices = await getPrices({
            accessToken,
            params,
          })
          setState((prev: UsePricesState) => ({
            ...prev,
            prices: prices,
          }))
        } catch (error: unknown) {
          setState((prev: UsePricesState) => ({
            ...prev,
            error:
              error instanceof Error ? error.message : "Failed to fetch prices",
          }))
        }
      })
    },
    [accessToken],
  )

  const clearPrices = useCallback(() => {
    setState((prev: UsePricesState) => ({ ...prev, prices: [] }))
  }, [])

  const clearError = useCallback(() => {
    setState((prev: UsePricesState) => ({ ...prev, error: null }))
  }, [])

  return {
    ...state,
    isPending,
    fetchPrices,
    clearPrices,
    clearError,
  }
}
