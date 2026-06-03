import {
  setShippingMethod as coreSetShippingMethod,
  type GetShipmentsResult,
  getShipments,
  type InterceptorManager,
} from "@commercelayer/core"
import type { DeliveryLeadTime, Shipment } from "@commercelayer/sdk"
import { useCallback } from "react"
import useSWR, { type KeyedMutator } from "swr"

interface UseShipmentsParams {
  accessToken?: string
  orderId?: string | null
  interceptors?: InterceptorManager
}

interface UseShipmentsReturn {
  shipments: Shipment[]
  deliveryLeadTimes: DeliveryLeadTime[]
  isLoading: boolean
  isValidating: boolean
  error: string | null
  setShippingMethod: (shipmentId: string, shippingMethodId: string) => Promise<void>
  reload: () => Promise<GetShipmentsResult | undefined>
  mutate: KeyedMutator<GetShipmentsResult>
}

/**
 * React hook for fetching shipments and delivery lead times for a Commerce Layer order.
 *
 * Uses SWR for data fetching and caching. Provides a `setShippingMethod` helper that
 * automatically refreshes the cached data after updating.
 *
 * @param accessToken - Commerce Layer API access token.
 * @param orderId - ID of the order whose shipments to fetch. Pass `null` or omit to skip fetching.
 * @param interceptors - Optional SDK interceptors.
 *
 * @example
 * ```tsx
 * const { shipments, deliveryLeadTimes, isLoading, setShippingMethod } = useShipments({
 *   accessToken,
 *   orderId: 'xYzAbCdE',
 * })
 * ```
 */
export function useShipments({
  accessToken,
  orderId,
  interceptors,
}: UseShipmentsParams): UseShipmentsReturn {
  const swrKey = accessToken && orderId ? ["shipments", "get", accessToken, orderId] : null

  const { data, error, isLoading, isValidating, mutate } = useSWR<GetShipmentsResult>(
    swrKey,
    async (): Promise<GetShipmentsResult> => {
      return getShipments({
        accessToken: accessToken as string,
        interceptors,
        orderId: orderId as string,
      })
    },
    { revalidateOnFocus: false, revalidateOnReconnect: false }
  )

  const setShippingMethod = useCallback(
    async (shipmentId: string, shippingMethodId: string): Promise<void> => {
      if (!accessToken) throw new Error("accessToken is required")
      await coreSetShippingMethod({ accessToken, interceptors, shipmentId, shippingMethodId })
      await mutate()
    },
    [accessToken, interceptors, mutate]
  )

  const reload = useCallback(async (): Promise<GetShipmentsResult | undefined> => {
    return await mutate()
  }, [mutate])

  return {
    shipments: data?.shipments ?? [],
    deliveryLeadTimes: data?.deliveryLeadTimes ?? [],
    isLoading,
    isValidating,
    error: error?.message ?? null,
    setShippingMethod,
    reload,
    mutate,
  }
}
