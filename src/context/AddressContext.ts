import { createContext } from 'react'
import {
  AddressState,
  SetAddress,
  SetAddressErrors,
  setAddress,
  setAddressErrors,
} from '#reducers/AddressReducer'

type DefaultContext = {
  saveAddresses: () => void
  setCloneAddress: (
    id: string,
    resource: 'billingAddress' | 'shippingAddress'
  ) => void
  setAddress: SetAddress
  setAddressErrors: SetAddressErrors
} & AddressState

export const defaultAddressContext = {
  saveAddresses: (): void => {
    return
  },
  setCloneAddress: (): void => {
    return
  },
  setAddress,
  setAddressErrors,
}

const AddressesContext = createContext<DefaultContext>(defaultAddressContext)

export default AddressesContext
