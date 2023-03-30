import { createContext, type RefObject } from 'react'
import {
  type PlaceOrderState,
  type setPlaceOrder,
  setPlaceOrderErrors
} from '#reducers/PlaceOrderReducer'

type DefaultContext = {
  setPlaceOrderErrors?: typeof setPlaceOrderErrors
  setPlaceOrder?: typeof setPlaceOrder
  placeOrderPermitted?: () => void
  setButtonRef?: (ref: RefObject<HTMLButtonElement>) => void
} & PlaceOrderState

export const defaultPlaceOrderContext = {
  setPlaceOrderErrors
}

const PlaceOrderContext = createContext<DefaultContext>(
  defaultPlaceOrderContext
)

export default PlaceOrderContext
