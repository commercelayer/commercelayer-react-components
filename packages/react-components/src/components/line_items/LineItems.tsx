import { useLineItems } from "@commercelayer/react-hooks-components"
import type { LineItem } from "@commercelayer/sdk"
import { type JSX, useCallback, useContext, useEffect, useRef } from "react"
import CommerceLayerContext from "#context/CommerceLayerContext"
import LineItemContext, { type LineItemContextValue } from "#context/LineItemContext"
import OrderContext from "#context/OrderContext"
import type { BaseError } from "#typings/errors"
import type { DefaultChildrenType } from "#typings/globals"
import type { TLineItem } from "./LineItem"

interface Props {
  children: DefaultChildrenType
  /**
   * Filter line items by item type. When provided, only matching types
   * are put into context (affects LineItem, LineItemsCount, LineItemsEmpty).
   */
  types?: TLineItem[]
  /**
   * Element to display while line items are loading.
   */
  loader?: JSX.Element
  /**
   * Called after a line item has been successfully updated.
   */
  onUpdate?: (lineItemId: string) => void
  /**
   * Called after a line item has been successfully deleted.
   */
  onDelete?: (lineItemId: string) => void
}

/**
 * What tells two versions of an order's line items apart: one added or
 * removed changes the ids, one edited changes its `updated_at`. `undefined`
 * when the list is unknown, as on an order fetched without its line items.
 */
function lineItemsSignature(
  lineItems: ReadonlyArray<Pick<LineItem, "id" | "updated_at">> | null | undefined
): string | undefined {
  if (lineItems == null) return undefined
  return lineItems
    .map(({ id, updated_at }) => `${id}@${updated_at}`)
    .sort()
    .join(",")
}

export function LineItems({
  children,
  types,
  loader = <>Loading...</>,
  onUpdate,
  onDelete,
}: Props): JSX.Element {
  const { accessToken } = useContext(CommerceLayerContext)
  const { orderId, order, getOrder } = useContext(OrderContext)

  const {
    lineItems: allLineItems,
    isLoading,
    error,
    updateLineItem: hookUpdate,
    deleteLineItem: hookDelete,
    reload: hookReload,
  } = useLineItems({ accessToken, orderId })

  const lineItems =
    types != null
      ? allLineItems.filter((li) => types.includes(li.item_type as TLineItem))
      : allLineItems

  // The hook keeps its own list of line items; the order does not come with
  // it. Everything that reads an amount — `<SubTotalAmount>`, `<TotalAmount>`,
  // `<TaxesAmount>` — reads the order out of `OrderContext`, so without this
  // the quantity changes on screen while the totals keep the old figures until
  // the page is reloaded. `<LineItemsContainer>` refetched the order through
  // the reducer's `getOrder`; standalone, this is where that has to happen.
  const refreshOrder = useCallback(async (): Promise<void> => {
    if (orderId == null || orderId === "") return
    await getOrder(orderId)
  }, [orderId, getOrder])

  // The other direction. When the order is updated externally and refetched,
  // the hook's cache does not revalidate on its own, so the totals would move
  // while the list, `<LineItemsCount>` and `<LineItemsEmpty>` stayed behind.
  // Every order comes with its line items, so compare them with the cached
  // ones and revalidate only when they differ: after our own update or delete
  // the cache is already fresh, and the order that follows matches it.
  const orderLineItems = order?.id === orderId ? order?.line_items : undefined
  const orderSignature = lineItemsSignature(orderLineItems)
  const cacheSignature = lineItemsSignature(allLineItems)
  // Read through a ref rather than listed as dependencies: the check has to
  // run when the order changes, not when the cache does. Otherwise our own
  // update, which refreshes the cache before the order, would trigger it too.
  const cacheRef = useRef({ signature: cacheSignature, isLoading })
  useEffect(() => {
    cacheRef.current = { signature: cacheSignature, isLoading }
  }, [cacheSignature, isLoading])
  useEffect(() => {
    const cache = cacheRef.current
    // still loading: the first fetch is already on its way and will be current
    if (orderSignature == null || cache.isLoading) return
    if (orderSignature === cache.signature) return
    void hookReload()
  }, [orderSignature, hookReload])

  const errors: BaseError[] = error
    ? [{ code: "INTERNAL_SERVER_ERROR", message: error, resource: "line_items" }]
    : []

  const contextValue: LineItemContextValue = {
    lineItems,
    loading: isLoading,
    errors,
    loader,
    updateLineItem: async (lineItemId, quantity = 1, hasExternalPrice) => {
      await hookUpdate(lineItemId, quantity, hasExternalPrice)
      await refreshOrder()
      onUpdate?.(lineItemId)
    },
    deleteLineItem: async (lineItemId) => {
      await hookDelete(lineItemId)
      await refreshOrder()
      onDelete?.(lineItemId)
    },
    reload: async () => {
      await hookReload()
    },
  }

  return (
    <LineItemContext.Provider value={contextValue}>
      {isLoading ? loader : children}
    </LineItemContext.Provider>
  )
}

export default LineItems
