import { createContext } from 'react'
import type { Parcel } from '@commercelayer/sdk'

export interface InitialParcelContext {
  parcel?: Parcel
}

const initial: InitialParcelContext = {}

export default createContext<InitialParcelContext>(initial)
