import { createContext } from 'react'
import { ShippingAddressState } from '#reducers/ShippingAddressReducer'

type DefaultContext = {
  setShippingAddress?: (
    id: string,
    options?: {
      customerAddressId: string
    }
  ) => void
} & ShippingAddressState

export const defaultShippingAddressContext = {}

const ShippingAddressContext = createContext<DefaultContext>(
  defaultShippingAddressContext
)

export default ShippingAddressContext
