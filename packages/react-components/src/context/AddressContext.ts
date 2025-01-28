import { createContext } from 'react'
import {
  type AddressState,
  setAddress,
  type AddressResource,
  type saveAddresses,
  type ICustomerAddress
} from '#reducers/AddressReducer'
import type { BaseError } from '#typings/errors'

type DefaultContext = {
  saveAddresses?: (params: {
    customerEmail?: string
    customerAddress?: ICustomerAddress
  }) => ReturnType<typeof saveAddresses>
  setCloneAddress: (id: string, resource: AddressResource) => void
  setAddress: typeof setAddress
  setAddressErrors: (errors: BaseError[], resource: AddressResource) => void
} & AddressState

export const defaultAddressContext = {
  setCloneAddress: () => {},
  setAddress,
  setAddressErrors: () => {}
}

const AddressesContext = createContext<DefaultContext>(defaultAddressContext)

export default AddressesContext
