import type { Address } from "@commercelayer/sdk"
import { createContext } from "react"

export interface InitialAddressContext {
  address: Address | undefined
}

const initial: InitialAddressContext = {
  address: undefined,
}

const AddressChildrenContext = createContext<InitialAddressContext>(initial)

export default AddressChildrenContext
