import type { Parcel } from "@commercelayer/sdk"
import { createContext } from "react"

export interface InitialParcelContext {
  parcel?: Parcel
}

const initial: InitialParcelContext = {}

export default createContext<InitialParcelContext>(initial)
