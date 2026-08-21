import {
  setInStockSubscription as coreSetInStockSubscription,
  type InterceptorManager,
} from "@commercelayer/core-components"
import { useCallback, useState } from "react"

interface UseInStockSubscriptionsParams {
  accessToken?: string
  interceptors?: InterceptorManager
}

interface UseInStockSubscriptionsReturn {
  isLoading: boolean
  setInStockSubscription: (params: { customerEmail?: string; skuCode: string }) => Promise<void>
}

/**
 * React hook for creating in-stock subscriptions in Commerce Layer.
 *
 * @param accessToken - Commerce Layer API access token.
 * @param interceptors - Optional SDK interceptors.
 *
 * @example
 * ```tsx
 * const { isLoading, setInStockSubscription } = useInStockSubscriptions({ accessToken })
 * await setInStockSubscription({ skuCode: 'TSHIRTMS000000FFFFFFXLXX' })
 * ```
 */
export function useInStockSubscriptions({
  accessToken,
  interceptors,
}: UseInStockSubscriptionsParams): UseInStockSubscriptionsReturn {
  const [isLoading, setIsLoading] = useState(false)

  const setInStockSubscription = useCallback(
    async ({
      customerEmail,
      skuCode,
    }: {
      customerEmail?: string
      skuCode: string
    }): Promise<void> => {
      if (!accessToken) throw new Error("accessToken is required")
      setIsLoading(true)
      try {
        await coreSetInStockSubscription({ accessToken, interceptors, customerEmail, skuCode })
      } finally {
        setIsLoading(false)
      }
    },
    [accessToken, interceptors]
  )

  return { isLoading, setInStockSubscription }
}
