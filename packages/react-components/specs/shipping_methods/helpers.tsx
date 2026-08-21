import type { DeliveryLeadTime, Shipment, ShippingMethod } from "@commercelayer/sdk"
import type { ReactNode } from "react"
import ShipmentChildrenContext from "#context/ShipmentChildrenContext"
import ShipmentContext, { defaultShipmentContext } from "#context/ShipmentContext"
import ShippingMethodChildrenContext from "#context/ShippingMethodChildrenContext"

export const MOCK_SHIPPING_METHOD: Partial<ShippingMethod> = {
  id: "sm_1",
  name: "Standard Shipping",
  // biome-ignore lint/suspicious/noExplicitAny: test cast
  scheme: "flat" as any,
  price_amount_for_shipment_cents: 500,
  formatted_price_amount_for_shipment: "€5.00",
}

export const MOCK_DELIVERY_LEAD_TIME: Partial<DeliveryLeadTime> = {
  id: "dlt_1",
  min_hours: 24,
  max_hours: 48,
  min_days: 1,
  max_days: 2,
  shipping_method: { id: "sm_1" } as ShippingMethod,
}

export const MOCK_SHIPMENT: Partial<Shipment> = {
  id: "ship_1",
  // biome-ignore lint/suspicious/noExplicitAny: test cast
  shipping_method: MOCK_SHIPPING_METHOD as any,
}

/** Provides ShippingMethodChildrenContext — for leaf components (Name, Price, RadioButton, DeliveryLeadTime) */
export function ShippingMethodProvider({
  children,
  shippingMethod = MOCK_SHIPPING_METHOD,
  currentShippingMethodId = "sm_1",
  deliveryLeadTimeForShipment = MOCK_DELIVERY_LEAD_TIME,
  shipmentId = "ship_1",
}: {
  children: ReactNode
  shippingMethod?: Partial<ShippingMethod> | null
  currentShippingMethodId?: string
  deliveryLeadTimeForShipment?: Partial<DeliveryLeadTime> | null
  shipmentId?: string
}) {
  return (
    <ShippingMethodChildrenContext.Provider
      value={{
        shippingMethod: shippingMethod as ShippingMethod,
        currentShippingMethodId,
        deliveryLeadTimeForShipment: deliveryLeadTimeForShipment as DeliveryLeadTime,
        shipmentId,
      }}
    >
      {children}
    </ShippingMethodChildrenContext.Provider>
  )
}

/** Provides ShipmentChildrenContext — for ShippingMethod container component */
export function ShipmentChildrenProvider({
  children,
  shippingMethods = [MOCK_SHIPPING_METHOD],
  currentShippingMethodId = "sm_1",
  deliveryLeadTimes = [MOCK_DELIVERY_LEAD_TIME],
  shipment = MOCK_SHIPMENT,
}: {
  children: ReactNode
  shippingMethods?: Array<Partial<ShippingMethod>> | null
  currentShippingMethodId?: string
  deliveryLeadTimes?: Array<Partial<DeliveryLeadTime>> | null
  shipment?: Partial<Shipment> | null
}) {
  return (
    <ShipmentChildrenContext.Provider
      value={{
        keyNumber: 0,
        shippingMethods: shippingMethods as ShippingMethod[],
        currentShippingMethodId,
        deliveryLeadTimes: deliveryLeadTimes as DeliveryLeadTime[],
        shipment: shipment as Shipment,
      }}
    >
      {children}
    </ShipmentChildrenContext.Provider>
  )
}

/** Provides ShipmentContext — for ShippingMethodRadioButton (needs setShippingMethod) */
export function ShipmentContextProvider({
  children,
  setShippingMethod,
}: {
  children: ReactNode
  setShippingMethod?: (
    shipmentId: string,
    shippingMethodId: string
  ) => Promise<{ success: boolean; order?: object }>
}) {
  return (
    <ShipmentContext.Provider
      value={{
        ...defaultShipmentContext,
        // biome-ignore lint/suspicious/noExplicitAny: test cast
        setShippingMethod: setShippingMethod as any,
      }}
    >
      {children}
    </ShipmentContext.Provider>
  )
}
