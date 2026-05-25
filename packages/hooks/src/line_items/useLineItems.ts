import {
  deleteLineItem as coreDeleteLineItem,
  getLineItems,
  type InterceptorManager,
  updateLineItem as coreUpdateLineItem,
} from "@commercelayer/core"
import type { LineItem } from "@commercelayer/sdk"
import { useCallback } from "react"
import useSWR, { type KeyedMutator } from "swr"

interface UseLineItemsParams {
  accessToken: string
  orderId?: string | null
  interceptors?: InterceptorManager
}

interface UseLineItemsReturn {
  lineItems: LineItem[]
  isLoading: boolean
  isValidating: boolean
  error: string | null
  updateLineItem: (
    lineItemId: string,
    quantity?: number,
    hasExternalPrice?: boolean
  ) => Promise<LineItem>
  deleteLineItem: (lineItemId: string) => Promise<void>
  reload: () => Promise<LineItem[] | undefined>
  mutate: KeyedMutator<LineItem[]>
}

/**
 * React hook for fetching and managing line items for a Commerce Layer order.
 *
 * Uses SWR for data fetching and caching. Provides `updateLineItem` and
 * `deleteLineItem` helpers that automatically refresh the cached data.
 *
 * @param accessToken - Commerce Layer API access token.
 * @param orderId - ID of the order whose line items to fetch. Pass `null` or omit to skip fetching.
 * @param interceptors - Optional SDK interceptors.
 *
 * @example
 * ```tsx
 * const { lineItems, isLoading, updateLineItem, deleteLineItem } = useLineItems({
 *   accessToken,
 *   orderId: 'xYzAbCdE',
 * })
 * ```
 */
export function useLineItems({
  accessToken,
  orderId,
  interceptors,
}: UseLineItemsParams): UseLineItemsReturn {
  const swrKey =
    accessToken && orderId ? ["line_items", "get", accessToken, orderId] : null

  const { data, error, isLoading, isValidating, mutate } = useSWR<LineItem[]>(
    swrKey,
    async (): Promise<LineItem[]> => {
      if (!orderId) throw new Error("orderId is required")
      return getLineItems({ accessToken, interceptors, orderId })
    },
    { revalidateOnFocus: false, revalidateOnReconnect: false }
  )

  const updateLineItem = useCallback(
    async (
      lineItemId: string,
      quantity?: number,
      hasExternalPrice?: boolean
    ): Promise<LineItem> => {
      const updated = await coreUpdateLineItem({
        accessToken,
        interceptors,
        lineItemId,
        quantity,
        hasExternalPrice,
      })
      await mutate()
      return updated
    },
    [accessToken, interceptors, mutate]
  )

  const deleteLineItem = useCallback(
    async (lineItemId: string): Promise<void> => {
      await coreDeleteLineItem({ accessToken, interceptors, lineItemId })
      await mutate()
    },
    [accessToken, interceptors, mutate]
  )

  const reload = useCallback(async (): Promise<LineItem[] | undefined> => {
    return await mutate()
  }, [mutate])

  return {
    lineItems: data ?? [],
    isLoading,
    isValidating,
    error: error?.message ?? null,
    updateLineItem,
    deleteLineItem,
    reload,
    mutate,
  }
}
