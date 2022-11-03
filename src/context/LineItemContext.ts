import { createContext } from 'react'
import { LineItemState } from '#reducers/LineItemReducer'
import { LineItem } from '@commercelayer/sdk'

export interface LineItemContextValue extends LineItemState {
  lineItems?: LineItem[] | undefined
}

const initial: LineItemContextValue = {
  lineItems: []
}

const LineItemContext = createContext<LineItemContextValue>(initial)

export default LineItemContext
