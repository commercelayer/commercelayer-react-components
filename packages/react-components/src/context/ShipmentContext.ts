import { createContext } from 'react'
import {
  ShipmentState,
  SetShipmentErrors,
  setShipmentErrors,
  setShippingMethod
} from '#reducers/ShipmentReducer'

type DefaultContext = {
  setShipmentErrors: SetShipmentErrors
  setShippingMethod?: (
    shipmentId: string,
    shippingMethodId: string
  ) => ReturnType<typeof setShippingMethod>
} & ShipmentState

export const defaultShipmentContext = {
  setShipmentErrors
}

const ShipmentContext = createContext<DefaultContext>(defaultShipmentContext)

export default ShipmentContext
