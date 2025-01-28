import { createContext } from 'react'
import type { LineItemState } from '#reducers/LineItemReducer'
import type { LineItem } from '@commercelayer/sdk'

export interface LineItemContextValue extends LineItemState {
  lineItems?: LineItem[] | null
}

const initial: LineItemContextValue = {}

const LineItemContext = createContext<LineItemContextValue>(initial)

export default LineItemContext
