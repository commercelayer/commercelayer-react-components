import type { InterceptorManager } from "@commercelayer/core"
import {
  updateOrder as coreUpdateOrder,
  retrieveOrder,
  type SaveOrderAddressesParams,
  saveOrderAddresses,
} from "@commercelayer/core"
import type { Order } from "@commercelayer/sdk"
import { useCallback, useState } from "react"
import useSWR from "swr"

interface UseAddressFormParams {
  accessToken: string
  orderId?: string | null
  interceptors?: InterceptorManager
}

interface UseAddressFormReturn {
  /** Current billing address field values (no prefix). */
  billingAddress: Record<string, unknown>
  /** Current shipping address field values (no prefix). */
  shippingAddress: Record<string, unknown>
  /** The fetched order. */
  order: Order | undefined
  isLoading: boolean
  isSaving: boolean
  error: string | null
  /** Update billing address field values. */
  setBillingAddress: (values: Record<string, unknown>) => void
  /** Update shipping address field values. */
  setShippingAddress: (values: Record<string, unknown>) => void
  /**
   * Save the current billing and/or shipping address to the order.
   *
   * @param params - Optional overrides for clone IDs, email, and ship-to-different flag.
   */
  saveAddresses: (params?: {
    customerEmail?: string
    shipToDifferentAddress?: boolean
    billingAddressCloneId?: string
    shippingAddressCloneId?: string
  }) => Promise<{ success: boolean; order?: Order; error?: unknown }>
}

/**
 * React hook for managing address form state and persisting addresses to a Commerce Layer order.
 *
 * Composes order fetching (via SWR) with local billing/shipping address state and a
 * `saveAddresses` mutation that calls the `saveOrderAddresses` core function and then
 * updates the order.
 *
 * @example
 * ```tsx
 * const { billingAddress, setBillingAddress, saveAddresses, isSaving } = useAddressForm({
 *   accessToken,
 *   orderId: 'xYzAbCdE',
 * })
 * ```
 */
export function useAddressForm({
  accessToken,
  orderId,
  interceptors,
}: UseAddressFormParams): UseAddressFormReturn {
  const {
    data: order,
    isLoading,
    error: swrError,
    mutate,
  } = useSWR(orderId != null ? `order-${orderId}` : null, () =>
    retrieveOrder({ accessToken, interceptors, id: orderId as string })
  )

  const [billingAddress, setBillingAddress] = useState<Record<string, unknown>>({})
  const [shippingAddress, setShippingAddress] = useState<Record<string, unknown>>({})
  const [isSaving, setIsSaving] = useState(false)

  const saveAddresses = useCallback(
    async (
      params: {
        customerEmail?: string
        shipToDifferentAddress?: boolean
        billingAddressCloneId?: string
        shippingAddressCloneId?: string
      } = {}
    ): Promise<{ success: boolean; order?: Order; error?: unknown }> => {
      if (order == null) return { success: false }

      setIsSaving(true)
      try {
        const saveParams: SaveOrderAddressesParams = {
          accessToken,
          interceptors,
          order,
          billingAddress,
          shippingAddress,
          ...params,
        }

        const { success, orderAttributes, error: saveError } = await saveOrderAddresses(saveParams)

        if (!success || orderAttributes == null) {
          return { success: false, error: saveError }
        }

        const { id, ...attributes } = orderAttributes
        const updatedOrder = await coreUpdateOrder({
          accessToken,
          interceptors,
          id: order.id,
          attributes,
        })

        await mutate(updatedOrder)
        return { success: true, order: updatedOrder }
      } catch (error) {
        console.error(error)
        return { success: false, error }
      } finally {
        setIsSaving(false)
      }
    },
    [accessToken, interceptors, order, billingAddress, shippingAddress, mutate]
  )

  return {
    billingAddress,
    shippingAddress,
    order,
    isLoading,
    isSaving,
    error: swrError != null ? String(swrError) : null,
    setBillingAddress,
    setShippingAddress,
    saveAddresses,
  }
}
