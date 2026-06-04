import { useContext, type ReactNode, useState, useEffect, type JSX } from "react"
import ShipmentContext from "#context/ShipmentContext"
import ShipmentChildrenContext, {
  type InitialShipmentContext,
} from "#context/ShipmentChildrenContext"
import getLoaderComponent from "#utils/getLoaderComponent"
import type { LoaderType } from "#typings"
import type { Order } from "@commercelayer/sdk"

interface ShipmentProps {
  children: ReactNode
  loader?: LoaderType
  autoSelectSingleShippingMethod?: boolean | ((order?: Order) => void)
}

export function Shipment({
  children,
  loader = "Loading...",
  autoSelectSingleShippingMethod = false,
}: ShipmentProps): JSX.Element {
  const [loading, setLoading] = useState(true)
  const { shipments, deliveryLeadTimes, setShippingMethod } = useContext(ShipmentContext)
  useEffect(() => {
    if (shipments != null) {
      if (autoSelectSingleShippingMethod) {
        const autoSelect = async (): Promise<void> => {
          for (const shipment of shipments) {
            const isSingle = shipment?.available_shipping_methods?.length === 1
            if (!shipment?.shipping_method && isSingle) {
              const [shippingMethod] = shipment?.available_shipping_methods || []
              if (shippingMethod && setShippingMethod != null) {
                const { success, order } = await setShippingMethod(shipment.id, shippingMethod.id)
                if (typeof autoSelectSingleShippingMethod === "function" && success) {
                  autoSelectSingleShippingMethod(order)
                }
              }
            } else {
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
    return () => {
      setLoading(true)
    }
    // biome-ignore lint/correctness/useExhaustiveDependencies: intentional
  }, [shipments?.length, setShippingMethod, shipments, autoSelectSingleShippingMethod])
  const components = shipments?.map((shipment, k) => {
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
    const stockTransfers = shipment.stock_transfers
    const parcels = shipment.parcels
    const times = deliveryLeadTimes?.filter(
      (time) => time.stock_location?.id === shipment.stock_location?.id
    )
    const shipmentProps: InitialShipmentContext = {
      parcels,
      lineItems,
      shippingMethods,
      currentShippingMethodId,
      stockTransfers,
      deliveryLeadTimes: times,
      shipment,
      keyNumber: shipment?.id,
    }
    return (
      // biome-ignore lint/suspicious/noArrayIndexKey: shipments don't have stable keys in this context
      <ShipmentChildrenContext.Provider key={k} value={shipmentProps}>
        {children}
      </ShipmentChildrenContext.Provider>
    )
  })
  return !loading ? <>{components}</> : getLoaderComponent(loader)
}

export default Shipment
