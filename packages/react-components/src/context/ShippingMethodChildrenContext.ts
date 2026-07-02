import type { DeliveryLeadTime, ShippingMethod } from "@commercelayer/sdk"
import { createContext } from "react"

export interface InitialShippingMethodContext {
  shippingMethod?: ShippingMethod
  deliveryLeadTimeForShipment?: DeliveryLeadTime
  currentShippingMethodId?: string
  shipmentId?: string
}

const initial: InitialShippingMethodContext = {}

const ShippingMethodChildrenContext = createContext<InitialShippingMethodContext>(initial)

export default ShippingMethodChildrenContext
