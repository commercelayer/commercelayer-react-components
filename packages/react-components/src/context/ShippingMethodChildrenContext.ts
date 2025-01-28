import { createContext } from 'react'
import type { DeliveryLeadTime, ShippingMethod } from '@commercelayer/sdk'

export interface InitialShippingMethodContext {
  shippingMethod?: ShippingMethod
  deliveryLeadTimeForShipment?: DeliveryLeadTime
  currentShippingMethodId?: string
  shipmentId?: string
}

const initial: InitialShippingMethodContext = {}

const ShippingMethodChildrenContext =
  createContext<InitialShippingMethodContext>(initial)

export default ShippingMethodChildrenContext
