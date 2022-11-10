import { createContext } from 'react'
import type { ParcelLineItem } from '@commercelayer/sdk'

export interface InitialParcelLineItemContext {
  parcelLineItem?: ParcelLineItem
}

const initial: InitialParcelLineItemContext = {}

export default createContext<InitialParcelLineItemContext>(initial)
