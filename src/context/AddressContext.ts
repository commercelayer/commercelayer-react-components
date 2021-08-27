import { createContext } from 'react'
import { AddressState, SetAddress, setAddress } from '#reducers/AddressReducer'
import { BaseError } from '#typings/errors'

type DefaultContext = {
  saveAddresses: () => void
  setCloneAddress: (
    id: string,
    resource: 'billingAddress' | 'shippingAddress'
  ) => void
  setAddress: SetAddress
  setAddressErrors: (
    errors: BaseError[],
    resource: 'billingAddress' | 'shippingAddress'
  ) => void
} & AddressState

export const defaultAddressContext = {
  saveAddresses: (): void => {
    return
  },
  setCloneAddress: (): void => {
    return
  },
  setAddress,
  setAddressErrors: () => {
    return
  },
}

const AddressesContext = createContext<DefaultContext>(defaultAddressContext)

export default AddressesContext
