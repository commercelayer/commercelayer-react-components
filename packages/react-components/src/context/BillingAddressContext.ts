import { createContext } from 'react'
import type { BillingAddressState } from '#reducers/BillingAddressReducer'

type DefaultContext = {
  setBillingAddress?: (
    id: string,
    options?: {
      customerAddressId: string
    }
  ) => Promise<void>
} & BillingAddressState

export const defaultBillingAddressContext = {}

const BillingAddressContext = createContext<DefaultContext>(
  defaultBillingAddressContext
)

export default BillingAddressContext
