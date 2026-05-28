import {
  createGiftCard,
  getGiftCards,
  type GiftCard,
  type GiftCardCreate,
  type GiftCardUpdate,
  type InterceptorManager,
  retrieveGiftCard,
  updateGiftCard,
} from "@commercelayer/core"
import { useCallback, useState } from "react"
import useSWR, { type KeyedMutator } from "swr"

const EMPTY_GIFT_CARDS: GiftCard[] = []

type UseAction = "get" | "retrieve" | "create" | "update" | null

interface UseGiftCardsReturn {
  giftCards: GiftCard[]
  error: string | null
  isLoading: boolean
  isValidating: boolean
  action: UseAction
  fetchGiftCards: (params?: Parameters<typeof getGiftCards>[0]["params"]) => void
  retrieveGiftCard: (id: string) => Promise<GiftCard | undefined>
  createGiftCard: (resource: GiftCardCreate) => Promise<GiftCard | undefined>
  updateGiftCard: (resource: GiftCardUpdate) => Promise<GiftCard | undefined>
  clearGiftCards: () => void
  clearError: () => void
  mutate: KeyedMutator<GiftCard[]>
}

/**
 * Custom hook for managing Commerce Layer gift cards with SWR caching.
 *
 * Provides list, retrieve, create, and update operations with action state tracking.
 * Uses SWR for data fetching and caching so only one network request fires per key.
 *
 * @param accessToken - Commerce Layer API access token
 * @param interceptors - Optional SDK interceptors for request/response customization
 * @returns Object containing gift card data, loading states, and action methods
 */
export function useGiftCards(
  accessToken: string,
  interceptors?: InterceptorManager
): UseGiftCardsReturn {
  const [fetchParams, setFetchParams] =
    useState<Parameters<typeof getGiftCards>[0]["params"]>()
  const [shouldFetch, setShouldFetch] = useState(false)
  const [action, setAction] = useState<UseAction>(null)

  const { data, error, isLoading, isValidating, mutate } = useSWR<GiftCard[]>(
    shouldFetch && accessToken ? ["gift_cards", "get", accessToken, fetchParams] : null,
    async (): Promise<GiftCard[]> =>
      getGiftCards({ accessToken, params: fetchParams, interceptors }),
    { revalidateOnFocus: false, revalidateOnReconnect: false }
  )

  const fetchGiftCards = useCallback(
    (newParams?: Parameters<typeof getGiftCards>[0]["params"]) => {
      setFetchParams(newParams)
      setShouldFetch(true)
      setAction("get")
    },
    []
  )

  const handleRetrieveGiftCard = useCallback(
    async (id: string): Promise<GiftCard | undefined> => {
      if (!id) throw new Error("Gift card ID is required for retrieve")
      setAction("retrieve")
      return retrieveGiftCard({ accessToken, id, interceptors })
    },
    [accessToken, interceptors]
  )

  const handleCreateGiftCard = useCallback(
    async (resource: GiftCardCreate): Promise<GiftCard | undefined> => {
      setAction("create")
      const result = await createGiftCard({ accessToken, resource, interceptors })
      await mutate(
        (current) => (current != null ? [...current, result] : [result]),
        { revalidate: false }
      )
      return result
    },
    [accessToken, interceptors, mutate]
  )

  const handleUpdateGiftCard = useCallback(
    async (resource: GiftCardUpdate): Promise<GiftCard | undefined> => {
      if (!resource?.id) throw new Error("Gift card resource ID is required for update")
      setAction("update")
      const result = await updateGiftCard({ accessToken, resource, interceptors })
      await mutate(
        (current) =>
          current?.map((gc: GiftCard) => (gc.id === result.id ? result : gc)) ?? [result],
        { revalidate: false }
      )
      return result
    },
    [accessToken, interceptors, mutate]
  )

  const clearGiftCards = useCallback(() => {
    setShouldFetch(false)
    setAction(null)
    // c8 ignore start
    mutate(undefined, false).catch(() => {})
    // c8 ignore end
  }, [mutate])

  const clearError = useCallback(() => mutate(data, false), [mutate, data])

  return {
    giftCards: data ?? EMPTY_GIFT_CARDS,
    error: error?.message ?? null,
    isLoading,
    isValidating,
    action,
    fetchGiftCards,
    retrieveGiftCard: handleRetrieveGiftCard,
    createGiftCard: handleCreateGiftCard,
    updateGiftCard: handleUpdateGiftCard,
    clearGiftCards,
    clearError,
    mutate,
  }
}
