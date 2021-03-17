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
  deliveryLeadTime?: DeliveryLeadTimeCollection | null
  shipment?: ShipmentCollection
}

const initial: InitialShipmentContext = {
  lineItems: [],
  shippingMethods: [],
  stockTransfers: [],
}

const ShipmentChildrenContext = createContext<InitialShipmentContext>(initial)

export default ShipmentChildrenContext
