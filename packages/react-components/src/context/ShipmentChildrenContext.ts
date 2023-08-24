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
  deliveryLeadTimes?: DeliveryLeadTime[] | null | undefined
  keyNumber: number | string
  lineItems?: Array<LineItem | null | undefined>
  parcels?: Parcel[] | null | undefined
  shipment?: Shipment
  shippingMethods?: ShippingMethod[] | null | undefined
  stockTransfers?: StockTransfer[] | null | undefined
}

const initial: InitialShipmentContext = {
  keyNumber: 0,
  lineItems: [],
  shippingMethods: [],
  stockTransfers: []
}

const ShipmentChildrenContext = createContext<InitialShipmentContext>(initial)

export default ShipmentChildrenContext
