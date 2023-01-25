import { createContext } from 'react'
import {
  AddressState,
  SetAddress,
  setAddress,
  AddressResource,
  saveAddresses
} from '#reducers/AddressReducer'
import { BaseError } from '#typings/errors'

type DefaultContext = {
  saveAddresses?: () => ReturnType<typeof saveAddresses>
  setCloneAddress: (id: string, resource: AddressResource) => void
  setAddress: SetAddress
  setAddressErrors: (errors: BaseError[], resource: AddressResource) => void
} & AddressState

export const defaultAddressContext = {
  setCloneAddress: () => {},
  setAddress,
  setAddressErrors: () => {}
}

const AddressesContext = createContext<DefaultContext>(defaultAddressContext)

export default AddressesContext
