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

// How many times a shipment is auto-selected in a row while the API keeps
// reporting no method afterwards. A coupon clears the method once; an API that
// never reports it set must not turn the selection into a loop.
const MAX_AUTO_SELECT_ATTEMPTS = 3

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

  // The latest shipments, read when a selection resolves. The refetch the
  // selection makes after its PATCH is in here by then, and if it still has no
  // method the API cleared it while the selection was in flight. That has to be
  // acted on there and then: the refetches that follow bring the same data, and
  // SWR hands back the previous array when a refetch is deep-equal to it, so no
  // new `shipments` identity ever re-runs the effect.
  const shipmentsRef = useRef(shipments)
  shipmentsRef.current = shipments

  // A shipping step that closes unmounts this component while a selection is
  // still in flight. Nothing it renders is on screen any more, and the data it
  // holds stops updating: `shipmentsRef` stays at the last render, which usually
  // predates the selection's own refetch, so every check read as "the API
  // cleared the method". Once unmounted, a run selects nothing more.
  const isMountedRef = useRef(false)
  useEffect(() => {
    isMountedRef.current = true
    return () => {
      isMountedRef.current = false
    }
  }, [])

  // When each selection settled, on a counter that only moves forward. A run
  // walks the `shipments` it started with, awaiting each selection in turn, so
  // by the time it reaches a later shipment another run may have selected it,
  // and the run's copy still shows it unselected. A shipment settled after the
  // run started is left alone: if the API has cleared it since, that arrives
  // as new `shipments`, and the run those start selects it again.
  const settledAtRef = useRef<Map<string, number>>(new Map())
  const selectionClockRef = useRef(0)

  useEffect(() => {
    if (shipments != null) {
      if (autoSelectSingleShippingMethod) {
        const startedAt = selectionClockRef.current
        const autoSelect = async (): Promise<void> => {
          for (const shipment of shipments) {
            if (!isMountedRef.current) return
            // Normalise once: `isSingle` below already proves the array is present, so
            // a second fallback at the destructuring site would be unreachable.
            const availableShippingMethods = shipment?.available_shipping_methods ?? []
            const isSingle = availableShippingMethods.length === 1
            if (!shipment?.shipping_method && isSingle) {
              const [shippingMethod] = availableShippingMethods
              if (shippingMethod && setShippingMethodRef.current != null) {
                const key = `${shipment.id}:${shippingMethod.id}`
                if (autoSelectedRef.current.get(key) === "pending") continue
                if ((settledAtRef.current.get(key) ?? -1) > startedAt) continue
                for (let attempt = 1; attempt <= MAX_AUTO_SELECT_ATTEMPTS; attempt++) {
                  autoSelectedRef.current.set(key, "pending")
                  const { success, order } = await setShippingMethodRef.current(
                    shipment.id,
                    shippingMethod.id
                  )
                  if (!success) {
                    autoSelectedRef.current.delete(key)
                    break
                  }
                  autoSelectedRef.current.set(key, "settled")
                  selectionClockRef.current += 1
                  settledAtRef.current.set(key, selectionClockRef.current)
                  if (typeof autoSelectSingleShippingMethod === "function") {
                    autoSelectSingleShippingMethod(order)
                  }
                  if (!isMountedRef.current) return
                  // The order the selection read back after its PATCH is the
                  // freshest word on whether the method stuck. The shipments
                  // only take over when that order does not say: it lacks this
                  // shipment, or was read without `shipments.shipping_method`
                  // (undefined, where a cleared method is null).
                  const readBack = order?.shipments?.find(({ id }) => id === shipment.id)
                  const latest =
                    readBack?.shipping_method !== undefined
                      ? readBack
                      : shipmentsRef.current?.find(({ id }) => id === shipment.id)
                  if (latest == null || latest.shipping_method != null) break
                }
              }
            } else {
              if (shipment?.shipping_method != null) {
                const key = `${shipment.id}:${shipment.shipping_method.id}`
                // A selection still in flight keeps its marker: data showing the
                // method can land before its PATCH resolves, and without the
                // marker an older run reaching this shipment would select it
                // again. The data counts as a settle all the same, so older runs
                // leave the shipment alone.
                if (autoSelectedRef.current.get(key) !== "pending") {
                  autoSelectedRef.current.delete(key)
                }
                selectionClockRef.current += 1
                settledAtRef.current.set(key, selectionClockRef.current)
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
