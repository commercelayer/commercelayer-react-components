import {
  type BaseMetadataObject,
  createOrder as coreCreateOrder,
  updateOrder as coreUpdateOrder,
  type InterceptorManager,
  retrieveOrder,
} from "@commercelayer/core-components"
import type { Order, OrderCreate, OrderUpdate } from "@commercelayer/sdk"
import { useCallback, useState } from "react"
import useSWR, { type KeyedMutator } from "swr"

interface UseOrderParams {
  accessToken: string
  orderId?: string | null
  interceptors?: InterceptorManager
}

interface UseOrderReturn {
  order: Order | undefined
  isLoading: boolean
  isValidating: boolean
  error: string | null
  createOrder: (params?: {
    metadata?: BaseMetadataObject
    attributes?: Omit<OrderCreate, "id">
  }) => Promise<Order | undefined>
  updateOrder: (id: string, attributes: Omit<OrderUpdate, "id">) => Promise<Order | undefined>
  reloadOrder: () => Promise<Order | undefined>
  mutate: KeyedMutator<Order>
}

/**
 * React hook for fetching and managing a single Commerce Layer order.
 *
 * Uses SWR for data fetching and caching. Provides `createOrder` and
 * `updateOrder` helpers that automatically refresh the cached data.
 *
 * @param accessToken - Commerce Layer API access token.
 * @param orderId - ID of the order to fetch. Pass `null` or omit to skip fetching.
 * @param interceptors - Optional SDK interceptors.
 *
 * @example
 * ```tsx
 * const { order, isLoading, updateOrder } = useOrder({
 *   accessToken,
 *   orderId: 'xYzAbCdE',
 * })
 * ```
 */
export function useOrder({ accessToken, orderId, interceptors }: UseOrderParams): UseOrderReturn {
  const [isCreating, setIsCreating] = useState(false)

  const swrKey = accessToken && orderId ? ["order", "retrieve", accessToken, orderId] : null

  const { data, error, isLoading, isValidating, mutate } = useSWR<Order>(
    swrKey,
    async (): Promise<Order> => {
      if (!orderId) throw new Error("orderId is required")
      return retrieveOrder({ accessToken, interceptors, id: orderId })
    },
    { revalidateOnFocus: false, revalidateOnReconnect: false }
  )

  const createOrder = useCallback(
    async (params?: {
      metadata?: BaseMetadataObject
      attributes?: Omit<OrderCreate, "id">
    }): Promise<Order | undefined> => {
      setIsCreating(true)
      try {
        return await coreCreateOrder({
          accessToken,
          interceptors,
          metadata: params?.metadata,
          attributes: params?.attributes,
        })
      } finally {
        setIsCreating(false)
      }
    },
    [accessToken, interceptors]
  )

  const updateOrder = useCallback(
    async (id: string, attributes: Omit<OrderUpdate, "id">): Promise<Order | undefined> => {
      const updated = await coreUpdateOrder({
        accessToken,
        interceptors,
        id,
        attributes,
      })
      await mutate(updated, { revalidate: false })
      return updated
    },
    [accessToken, interceptors, mutate]
  )

  const reloadOrder = useCallback(async (): Promise<Order | undefined> => {
    return await mutate()
  }, [mutate])

  return {
    order: data,
    isLoading: isLoading || isCreating,
    isValidating,
    error: error?.message ?? null,
    createOrder,
    updateOrder,
    reloadOrder,
    mutate,
  }
}
