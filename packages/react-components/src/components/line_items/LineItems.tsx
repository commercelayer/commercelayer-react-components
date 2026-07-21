import { useLineItems } from "@commercelayer/react-hooks-components"
import { type JSX, useContext } from "react"
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

export function LineItems({
  children,
  types,
  loader = <>Loading...</>,
  onUpdate,
  onDelete,
}: Props): JSX.Element {
  const { accessToken } = useContext(CommerceLayerContext)
  const { orderId } = useContext(OrderContext)

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
      onUpdate?.(lineItemId)
    },
    deleteLineItem: async (lineItemId) => {
      await hookDelete(lineItemId)
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
