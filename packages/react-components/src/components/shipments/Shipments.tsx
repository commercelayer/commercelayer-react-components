import { useShipments } from "@commercelayer/react-hooks-components"
import type { Order } from "@commercelayer/sdk"
import { type JSX, useCallback, useContext, useEffect, useMemo, useRef, useState } from "react"
import CommerceLayerContext from "#context/CommerceLayerContext"
import OrderContext from "#context/OrderContext"
import ShipmentContext from "#context/ShipmentContext"
import type { SetShipmentErrors } from "#reducers/ShipmentReducer"
import type { LoaderType } from "#typings"
import type { BaseError } from "#typings/errors"
import type { DefaultChildrenType } from "#typings/globals"
import { canPlaceOrder } from "#utils/canPlaceOrder"
import getLoaderComponent from "#utils/getLoaderComponent"

interface Props {
  children: DefaultChildrenType
  /**
   * Element to display while shipments are loading.
   */
  loader?: LoaderType
}

export function Shipments({ children, loader = "Loading..." }: Props): JSX.Element {
  const { accessToken } = useContext(CommerceLayerContext)
  const { orderId, order, getOrder } = useContext(OrderContext)

  const {
    shipments,
    deliveryLeadTimes,
    isLoading,
    reload,
    setShippingMethod: hookSetShippingMethod,
  } = useShipments({ accessToken, orderId })

  const [errors, setErrors] = useState<BaseError[]>([])

  // The shipments cache is keyed on (accessToken, orderId) alone, so it never
  // revalidates on its own. The API, though, re-evaluates shipments whenever the
  // order changes: applying a coupon clears `shipment.shipping_method` server-side,
  // because shipping method availability depends on the order totals. Left stale,
  // the cached shipment keeps a shipping method the order no longer has, so
  // `<ShippingMethodRadioButton>` stays checked on it — and re-clicking a checked
  // radio fires no change event, leaving the user unable to re-select. Refetch
  // whenever the order moves on.
  const syncedOrderUpdatedAt = useRef<string | undefined>(undefined)

  useEffect(() => {
    const updatedAt = order?.updated_at
    if (updatedAt == null) return
    // First order we see: the initial shipments fetch is already in step with it.
    if (syncedOrderUpdatedAt.current == null) {
      syncedOrderUpdatedAt.current = updatedAt
      return
    }
    if (syncedOrderUpdatedAt.current === updatedAt) return
    syncedOrderUpdatedAt.current = updatedAt
    void reload()
  }, [order?.updated_at, reload])

  useEffect(() => {
    const nextErrors: BaseError[] = []

    if (order != null && shipments.length > 0) {
      const hasShippingMethods = shipments.map(
        (shipment) =>
          shipment.available_shipping_methods != null &&
          shipment.available_shipping_methods.length > 0
      )
      if (hasShippingMethods.includes(false)) {
        nextErrors.push({
          code: "NO_SHIPPING_METHODS",
          message: "No shipping methods",
          resource: "shipments",
        })
      }
    }

    if (order?.line_items != null && order.line_items.length > 0) {
      const hasStocks = order.line_items
        .filter(({ item_type: itemType }) => itemType === "skus")
        .map((lineItem) => {
          const conditions =
            // @ts-expect-error no type
            lineItem.item?.do_not_ship ||
            // @ts-expect-error no type
            lineItem.item?.do_not_track ||
            // @ts-expect-error no type
            lineItem.item?.inventory?.quantity >= lineItem?.quantity
          return !!conditions
        })
      if (hasStocks.includes(false)) {
        nextErrors.push({
          code: "OUT_OF_STOCK",
          message: "No stock available",
          resource: "line_items",
        })
      }
    }

    // Use functional updater to bail out when errors haven't changed,
    // preventing re-render loops when shipments/order return new references.
    setErrors((prev) => {
      if (
        prev.length === nextErrors.length &&
        prev.every((e, i) => e.code === nextErrors[i]?.code)
      ) {
        return prev
      }
      return nextErrors
    })
    // No cleanup: errors are always recomputed from current deps.
    // The old cleanup setErrors([]) caused an unnecessary extra re-render.
  }, [shipments, order])

  const setShippingMethod = useCallback(
    async (
      shipmentId: string,
      shippingMethodId: string
    ): Promise<{ success: boolean; order?: Order }> => {
      try {
        if (order != null && !canPlaceOrder(order)) {
          return { success: false, order }
        }
        await hookSetShippingMethod(shipmentId, shippingMethodId)
        if (getOrder != null && orderId != null) {
          const currentOrder = await getOrder(orderId)
          // `hookSetShippingMethod` has already revalidated the shipments cache,
          // so this order revision is in step — stamp it so the effect above
          // doesn't refetch shipments a second time for our own update.
          if (currentOrder?.updated_at != null) {
            syncedOrderUpdatedAt.current = currentOrder.updated_at
          }
          return { success: true, order: currentOrder }
        }
        return { success: true }
      } catch {
        return { success: false }
      }
    },
    [order, hookSetShippingMethod, getOrder, orderId]
  )

  const setShipmentErrors = useCallback((errs: BaseError[]) => setErrors(errs), [])

  const contextValue = useMemo(
    () => ({
      shipments: shipments.length > 0 ? shipments : null,
      deliveryLeadTimes,
      errors,
      setShipmentErrors: setShipmentErrors as SetShipmentErrors,
      setShippingMethod,
    }),
    [shipments, deliveryLeadTimes, errors, setShipmentErrors, setShippingMethod]
  )

  if (isLoading) {
    return getLoaderComponent(loader)
  }

  return <ShipmentContext.Provider value={contextValue}>{children}</ShipmentContext.Provider>
}

export default Shipments
