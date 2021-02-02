import { createContext } from 'react'
import {
  DeliveryLeadTimeCollection,
  ShippingMethodCollection,
} from '@commercelayer/js-sdk'

export interface InitialShippingMethodContext {
  shippingMethod: ShippingMethodCollection | Record<string, string>
  deliveryLeadTimeForShipment:
    | DeliveryLeadTimeCollection
    | Record<string, string>
  currentShippingMethodId?: string
}

const initial: InitialShippingMethodContext = {
  shippingMethod: {},
  deliveryLeadTimeForShipment: {},
}

const ShippingMethodChildrenContext = createContext<InitialShippingMethodContext>(
  initial
)

export default ShippingMethodChildrenContext
