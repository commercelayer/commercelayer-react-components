import { createContext, type RefObject } from 'react'
import {
  type PlaceOrderState,
  type setPlaceOrder,
  setPlaceOrderErrors,
  setPlaceOrderStatus
} from '#reducers/PlaceOrderReducer'

type DefaultContext = {
  setPlaceOrderErrors?: typeof setPlaceOrderErrors
  setPlaceOrder?: typeof setPlaceOrder
  placeOrderPermitted?: () => void
  setButtonRef?: (ref: RefObject<HTMLButtonElement | null>) => void
  setPlaceOrderStatus?: typeof setPlaceOrderStatus
} & PlaceOrderState

export const defaultPlaceOrderContext: DefaultContext = {
  setPlaceOrderStatus,
  setPlaceOrderErrors,
  status: 'standby'
}

const PlaceOrderContext = createContext<DefaultContext>(
  defaultPlaceOrderContext
)

export default PlaceOrderContext
