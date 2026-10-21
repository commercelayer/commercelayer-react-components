import type { DeliveryLeadTime, Order, Shipment as SdkShipment } from "@commercelayer/sdk"
import { type JSX, type ReactNode, useContext, useEffect, useMemo, useRef, useState } from "react"
import ShipmentChildrenContext, {
  type InitialShipmentContext,
} from "#context/ShipmentChildrenContext"
import ShipmentContext from "#context/ShipmentContext"
import type { LoaderType } from "#typings"
import getLoaderComponent from "#utils/getLoaderComponent"

interface ShipmentProps {
  children: ReactNode
  loader?: LoaderType
  autoSelectSingleShippingMethod?: boolean | ((order?: Order) => void)
}

interface ShipmentItemProps {
  autoSelectSingleShippingMethod: ShipmentProps["autoSelectSingleShippingMethod"]
  children: ReactNode
  deliveryLeadTimes: DeliveryLeadTime[] | undefined
  shipment: SdkShipment
}

/**
 * Renders a single shipment's context provider.
 * Extracted as a component so `useMemo` can stabilise the context value,
 * preventing child components (e.g. ShippingMethod) from re-rendering when
 * the parent Shipment re-renders for unrelated reasons.
 */
function ShipmentItem({
  autoSelectSingleShippingMethod,
  children,
  deliveryLeadTimes,
  shipment,
}: ShipmentItemProps): JSX.Element {
  const shipmentProps = useMemo<InitialShipmentContext>(() => {
    const shipmentLineItems = shipment.stock_line_items
    const lineItems = shipmentLineItems?.map((shipmentLineItem) => {
      const l = shipmentLineItem.line_item
      if (l) l.quantity = shipmentLineItem.quantity
      return l
    })
    const shippingMethods = shipment.available_shipping_methods
    const currentShippingMethodId =
      autoSelectSingleShippingMethod && shippingMethods && shippingMethods.length === 1
        ? shippingMethods[0]?.id
        : shipment.shipping_method?.id
    const times = deliveryLeadTimes?.filter(
      (time) => time.stock_location?.id === shipment.stock_location?.id
    )
    return {
      parcels: shipment.parcels,
      lineItems,
      shippingMethods,
      currentShippingMethodId,
      stockTransfers: shipment.stock_transfers,
      deliveryLeadTimes: times,
      shipment,
      keyNumber: shipment?.id,
    }
  }, [shipment, deliveryLeadTimes, autoSelectSingleShippingMethod])

  return (
    <ShipmentChildrenContext.Provider value={shipmentProps}>
      {children}
    </ShipmentChildrenContext.Provider>
  )
}

export function Shipment({
  children,
  loader = "Loading...",
  autoSelectSingleShippingMethod = false,
}: ShipmentProps): JSX.Element {
  const [loading, setLoading] = useState(true)
  const { shipments, deliveryLeadTimes, setShippingMethod } = useContext(ShipmentContext)
  // Keep a ref so the autoSelect effect can always call the latest setShippingMethod
  // without listing it as a dependency. If setShippingMethod were a dep, the effect
  // would re-run every time order updates (after calling setShippingMethod), which
  // re-triggers autoSelect before SWR refetches shipments — causing an infinite loop.
  const setShippingMethodRef = useRef(setShippingMethod)
  setShippingMethodRef.current = setShippingMethod

  // Shipments that this component has already auto-selected a method for, keyed
  // `<shipment id>:<shipping method id>`, and whether that selection is still in
  // flight. The effect re-runs on every new `shipments` identity, and the
  // refetch that follows a selection lands while it is in flight, before the
  // API reports the method as set — so without this the same shipment gets
  // selected twice, and a caller passing a callback (analytics, typically) is
  // told about it twice.
  //
  // Once the selection has resolved, its own refetch is behind us: shipments
  // that arrive later still without the method mean the API cleared it —
  // applying a coupon does that — and the shipment is selected again. Waiting
  // for the data to show the method set before forgetting the selection is not
  // enough: a coupon applied while the selection is in flight clears the method
  // before any refetch reports it, and the shipment would stay unselected, and
  // the step on the loader, for good.
  const autoSelectedRef = useRef<Map<string, "pending" | "settled">>(new Map())

  useEffect(() => {
    if (shipments != null) {
      if (autoSelectSingleShippingMethod) {
        const autoSelect = async (): Promise<void> => {
          for (const shipment of shipments) {
            // Normalise once: `isSingle` below already proves the array is present, so
            // a second fallback at the destructuring site would be unreachable.
            const availableShippingMethods = shipment?.available_shipping_methods ?? []
            const isSingle = availableShippingMethods.length === 1
            if (!shipment?.shipping_method && isSingle) {
              const [shippingMethod] = availableShippingMethods
              if (shippingMethod && setShippingMethodRef.current != null) {
                const key = `${shipment.id}:${shippingMethod.id}`
                if (autoSelectedRef.current.get(key) === "pending") continue
                autoSelectedRef.current.set(key, "pending")
                const { success, order } = await setShippingMethodRef.current(
                  shipment.id,
                  shippingMethod.id
                )
                if (success) autoSelectedRef.current.set(key, "settled")
                else autoSelectedRef.current.delete(key)
                if (typeof autoSelectSingleShippingMethod === "function" && success) {
                  autoSelectSingleShippingMethod(order)
                }
              }
            } else {
              if (shipment?.shipping_method != null) {
                autoSelectedRef.current.delete(`${shipment.id}:${shipment.shipping_method.id}`)
              }
              setTimeout(() => {
                setLoading(false)
              }, 200)
            }
          }
        }
        autoSelect()
      } else {
        setLoading(false)
      }
    }
    // No cleanup: resetting setLoading(true) on every dep change caused an
    // unnecessary extra re-render that contributed to infinite update loops.
    // setShippingMethod is accessed via setShippingMethodRef (see above).
  }, [shipments, autoSelectSingleShippingMethod])

  const components = shipments?.map((shipment, k) => (
    <ShipmentItem
      // biome-ignore lint/suspicious/noArrayIndexKey: shipments don't have stable keys in this context
      key={k}
      autoSelectSingleShippingMethod={autoSelectSingleShippingMethod}
      deliveryLeadTimes={deliveryLeadTimes}
      shipment={shipment}
    >
      {children}
    </ShipmentItem>
  ))

  return !loading ? <>{components}</> : getLoaderComponent(loader)
}

export default Shipment
