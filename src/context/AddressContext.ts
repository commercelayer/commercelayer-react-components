import { createContext } from 'react'
import {
  AddressResource,
  AddressState,
  SetAddress,
  setAddress,
} from '#reducers/AddressReducer'
import { BaseError } from '#typings/errors'

type DefaultContext = {
  saveAddresses: (addressId?: string) => void
  setCloneAddress: (id: string, resource: AddressResource) => void
  setAddress: SetAddress
  setAddressErrors: (errors: BaseError[], resource: AddressResource) => void
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
