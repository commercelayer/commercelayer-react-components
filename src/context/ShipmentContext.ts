import { createContext } from 'react'
import {
  ShipmentState,
  SetShipmentErrors,
  setShipmentErrors
} from '#reducers/ShipmentReducer'

type DefaultContext = {
  setShipmentErrors: SetShipmentErrors
  setShippingMethod: (
    shipmentId: string,
    shippingMethodId: string
  ) => Promise<void>
} & ShipmentState

export const defaultShipmentContext = {
  setShipmentErrors,
  setShippingMethod: async (): Promise<void> => {}
}

const ShipmentContext = createContext<DefaultContext>(defaultShipmentContext)

export default ShipmentContext
