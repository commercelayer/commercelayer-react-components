import { createContext } from 'react'
import {
  SetBillingAddress,
  setBillingAddress,
  BillingAddressState,
} from '#reducers/BillingAddressReducer'

type DefaultContext = {
  setBillingAddress: SetBillingAddress
} & BillingAddressState

export const defaultBillingAddressContext = {
  setBillingAddress,
}

const BillingAddressContext = createContext<DefaultContext>(
  defaultBillingAddressContext
)

export default BillingAddressContext
