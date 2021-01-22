import { createContext } from 'react'
import { BillingAddressState } from '#reducers/BillingAddressReducer'

type DefaultContext = {
  setBillingAddress?: (
    id: string,
    options?: {
      customerAddressId: string
    }
  ) => void
} & BillingAddressState

export const defaultBillingAddressContext = {
  setBillingAddress: (): void => {
    return
  },
}

const BillingAddressContext = createContext<DefaultContext>(
  defaultBillingAddressContext
)

export default BillingAddressContext
