import { createContext } from 'react'
import {
  DeliveryLeadTimeCollection,
  LineItemCollection,
  ShippingMethodCollection,
  StockTransferCollection,
} from '@commercelayer/js-sdk'
import { SingleRelationship } from '@commercelayer/js-sdk/dist/typings/Library'

export interface InitialShipmentContext {
  lineItems?: SingleRelationship<LineItemCollection>[]
  shippingMethods?: ShippingMethodCollection[]
  currentShippingMethodId?: string
  stockTransfers?: StockTransferCollection[]
  deliveryLeadTime?: DeliveryLeadTimeCollection | null
}

const initial: InitialShipmentContext = {
  lineItems: [],
  shippingMethods: [],
  stockTransfers: [],
}

const ShipmentChildrenContext = createContext<InitialShipmentContext>(initial)

export default ShipmentChildrenContext
