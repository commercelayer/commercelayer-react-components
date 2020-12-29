import { createContext } from 'react'
import {
  AddressState,
  SetAddress,
  SetAddressErrors,
  setAddress,
  setAddressErrors,
} from '../reducers/AddressReducer'

type DefaultContext = {
  saveAddresses: () => void
  setAddress: SetAddress
  setAddressErrors: SetAddressErrors
} & AddressState

export const defaultAddressContext = {
  saveAddresses: (): void => {
    return
  },
  setAddress,
  setAddressErrors,
}

const AddressesContext = createContext<DefaultContext>(defaultAddressContext)

export default AddressesContext
