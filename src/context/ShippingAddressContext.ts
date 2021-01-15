import { createContext } from 'react'
import {
  SetShippingAddress,
  setShippingAddress,
  ShippingAddressState,
} from '#reducers/ShippingAddressReducer'

type DefaultContext = {
  setShippingAddress: SetShippingAddress
} & ShippingAddressState

export const defaultShippingAddressContext = {
  setShippingAddress,
}

const ShippingAddressContext = createContext<DefaultContext>(
  defaultShippingAddressContext
)

export default ShippingAddressContext
