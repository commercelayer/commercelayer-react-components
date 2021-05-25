import { createContext } from 'react'
import {
  PlaceOrderState,
  SetPlaceOrderErrors,
  setPlaceOrderErrors,
} from '#reducers/PlaceOrderReducer'

type DefaultContext = {
  setPlaceOrderErrors?: SetPlaceOrderErrors
  setPlaceOrder?: () => Promise<{ placed: boolean }>
  placeOrderPermitted?: () => void
} & PlaceOrderState

export const defaultPlaceOrderContext = {
  setPlaceOrderErrors,
}

const PlaceOrderContext = createContext<DefaultContext>(
  defaultPlaceOrderContext
)

export default PlaceOrderContext
