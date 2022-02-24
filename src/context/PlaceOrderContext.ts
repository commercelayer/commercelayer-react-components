import { createContext } from 'react'
import {
  PlaceOrderOptions,
  PlaceOrderState,
  SetPlaceOrderErrors,
  setPlaceOrderErrors,
} from '#reducers/PlaceOrderReducer'
import { PaymentSourceType } from '#reducers/PaymentMethodReducer'

type DefaultContext = {
  setPlaceOrderErrors?: SetPlaceOrderErrors
  setPlaceOrder?: ({
    paymentSource,
  }: {
    paymentSource?: PaymentSourceType
    options?: PlaceOrderOptions
  }) => Promise<{ placed: boolean }>
  placeOrderPermitted?: () => void
} & PlaceOrderState

export const defaultPlaceOrderContext = {
  setPlaceOrderErrors,
}

const PlaceOrderContext = createContext<DefaultContext>(
  defaultPlaceOrderContext
)

export default PlaceOrderContext
