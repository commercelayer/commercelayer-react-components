import { createContext } from "react"
import {
  type SetShipmentErrors,
  type ShipmentState,
  setShipmentErrors,
  type setShippingMethod,
} from "#reducers/ShipmentReducer"

type DefaultContext = {
  setShipmentErrors: SetShipmentErrors
  /**
   * The shipments on screen are being fetched again, after the first load:
   * the order changed and the API may have cleared a shipping method or
   * replaced a shipment, so until the refetch lands they can be out of date.
   */
  isRefreshing?: boolean
  setShippingMethod?: (
    shipmentId: string,
    shippingMethodId: string
  ) => ReturnType<typeof setShippingMethod>
} & ShipmentState

export const defaultShipmentContext = {
  setShipmentErrors,
}

const ShipmentContext = createContext<DefaultContext>(defaultShipmentContext)

export default ShipmentContext
