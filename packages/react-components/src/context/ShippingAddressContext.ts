import { createContext } from 'react'
import type { ShippingAddressState } from '#reducers/ShippingAddressReducer'

type DefaultContext = {
  setShippingAddress?: (
    id: string,
    options?: {
      customerAddressId: string
    }
  ) => Promise<void>
} & ShippingAddressState

export const defaultShippingAddressContext = {}

const ShippingAddressContext = createContext<DefaultContext>(
  defaultShippingAddressContext
)

export default ShippingAddressContext
