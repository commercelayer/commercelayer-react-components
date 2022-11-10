import { createContext } from 'react'
import type {
  DeliveryLeadTime,
  LineItem,
  Parcel,
  Shipment,
  ShippingMethod,
  StockTransfer
} from '@commercelayer/sdk'

export interface InitialShipmentContext {
  currentShippingMethodId?: string
  deliveryLeadTimes?: DeliveryLeadTime[]
  keyNumber: number
  lineItems?: LineItem[]
  parcels?: Parcel[]
  shipment?: Shipment
  shippingMethods?: ShippingMethod[]
  stockTransfers?: StockTransfer[]
}

const initial: InitialShipmentContext = {
  keyNumber: 0,
  lineItems: [],
  shippingMethods: [],
  stockTransfers: []
}

const ShipmentChildrenContext = createContext<InitialShipmentContext>(initial)

export default ShipmentChildrenContext
