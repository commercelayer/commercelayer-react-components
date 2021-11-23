import { createContext } from 'react'
import { Address } from '@commercelayer/sdk'

export interface InitialAddressContext {
  address: Address | Record<string, any>
}

const initial: InitialAddressContext = {
  address: {},
}

const AddressChildrenContext = createContext<InitialAddressContext>(initial)

export default AddressChildrenContext
