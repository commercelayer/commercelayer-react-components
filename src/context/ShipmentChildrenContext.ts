import { createContext } from 'react'
import {
  DeliveryLeadTimeCollection,
  LineItemCollection,
  ShipmentCollection,
  ShippingMethodCollection,
  StockTransferCollection,
} from '@commercelayer/js-sdk'

export interface InitialShipmentContext {
  lineItems?: LineItemCollection[]
  shippingMethods?: ShippingMethodCollection[]
  currentShippingMethodId?: string
  stockTransfers?: StockTransferCollection[]
  deliveryLeadTimes?: DeliveryLeadTimeCollection[] | null
  shipment?: ShipmentCollection
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
