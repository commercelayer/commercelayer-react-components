import { createContext } from 'react'
import {
  DeliveryLeadTime,
  LineItem,
  Shipment,
  ShippingMethod,
  StockTransfer,
} from '@commercelayer/sdk'

export interface InitialShipmentContext {
  lineItems?: LineItem[]
  shippingMethods?: ShippingMethod[]
  currentShippingMethodId?: string
  stockTransfers?: StockTransfer[]
  deliveryLeadTimes?: DeliveryLeadTime[] | null
  shipment?: Shipment
  keyNumber: number
}

const initial: InitialShipmentContext = {
  lineItems: [],
  shippingMethods: [],
  stockTransfers: [],
  keyNumber: 0,
}

const ShipmentChildrenContext = createContext<InitialShipmentContext>(initial)

export default ShipmentChildrenContext
