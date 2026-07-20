import type { ParcelLineItem } from "@commercelayer/sdk"
import { createContext } from "react"

export interface InitialParcelLineItemContext {
  parcelLineItem?: ParcelLineItem
}

const initial: InitialParcelLineItemContext = {}

export default createContext<InitialParcelLineItemContext>(initial)
