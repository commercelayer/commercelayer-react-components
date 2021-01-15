import { createContext } from 'react'
import { AddressCollection } from '@commercelayer/js-sdk'

export interface InitialAddressContext {
  address: AddressCollection | Record<string, any>
}

const initial: InitialAddressContext = {
  address: {},
}

const AddressChildrenContext = createContext<InitialAddressContext>(initial)

export default AddressChildrenContext
