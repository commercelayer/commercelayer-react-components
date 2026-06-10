import { createContext, type RefObject } from "react"
import {
  type PlaceOrderState,
  type setPlaceOrder,
  setPlaceOrderErrors,
  setPlaceOrderStatus,
} from "#reducers/PlaceOrderReducer"

type DefaultContext = {
  /** Sentinel set to `true` by `usePlaceOrder` / `<PlaceOrderContainer>` to signal that a provider is already present. */
  _isProvided?: true
  setPlaceOrderErrors?: typeof setPlaceOrderErrors
  setPlaceOrder?: typeof setPlaceOrder
  placeOrderPermitted?: () => void
  setButtonRef?: (ref: RefObject<HTMLButtonElement | null>) => void
  setPlaceOrderStatus?: typeof setPlaceOrderStatus
} & PlaceOrderState

export const defaultPlaceOrderContext: DefaultContext = {
  setPlaceOrderStatus,
  setPlaceOrderErrors,
  status: "standby",
}

const PlaceOrderContext = createContext<DefaultContext>(defaultPlaceOrderContext)

export default PlaceOrderContext
