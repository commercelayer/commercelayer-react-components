import { createContext } from 'react'
import {
  type ShipmentState,
  type SetShipmentErrors,
  setShipmentErrors,
  type setShippingMethod
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
