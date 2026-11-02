import {
  deleteLineItem as coreDeleteLineItem,
  updateLineItem as coreUpdateLineItem,
  getLineItems,
  type InterceptorManager,
} from "@commercelayer/core-components"
import type { LineItem } from "@commercelayer/sdk"
import { useCallback } from "react"
import useSWR, { type KeyedMutator, useSWRConfig } from "swr"

interface UseLineItemsParams {
  accessToken?: string
  orderId?: string | null
  interceptors?: InterceptorManager
}

type LineItemsOfOrder = Pick<UseLineItemsParams, "accessToken" | "orderId">

function lineItemsKey(
  accessToken: LineItemsOfOrder["accessToken"],
  orderId: LineItemsOfOrder["orderId"]
): readonly [string, string, string, string] | null {
  return accessToken && orderId ? ["line_items", "get", accessToken, orderId] : null
}

/**
 * React hook that returns a function to refetch the line items of an order
 * from outside `useLineItems`, for code that changes the order and must not
 * leave a mounted list behind.
 *
 * The returned promise settles once the mounted `useLineItems` hooks hold the
 * new list. It does nothing when no hook is mounted for that order.
 *
 * @example
 * ```tsx
 * const reloadLineItems = useReloadLineItems()
 * await reloadLineItems({ accessToken, orderId: 'xYzAbCdE' })
 * ```
 */
export function useReloadLineItems(): (params: LineItemsOfOrder) => Promise<void> {
  const { mutate } = useSWRConfig()
  return useCallback(
    async ({ accessToken, orderId }: LineItemsOfOrder): Promise<void> => {
      const key = lineItemsKey(accessToken, orderId)
      if (key == null) return
      await mutate(key)
    },
    [mutate]
  )
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
  const swrKey = lineItemsKey(accessToken, orderId)

  const { data, error, isLoading, isValidating, mutate } = useSWR<LineItem[]>(
    swrKey,
    async (): Promise<LineItem[]> => {
      return getLineItems({
        accessToken: accessToken as string,
        interceptors,
        orderId: orderId as string,
      })
    },
    { revalidateOnFocus: false, revalidateOnReconnect: false }
  )

  const updateLineItem = useCallback(
    async (
      lineItemId: string,
      quantity?: number,
      hasExternalPrice?: boolean
    ): Promise<LineItem> => {
      if (!accessToken) throw new Error("accessToken is required")
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
      if (!accessToken) throw new Error("accessToken is required")
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
