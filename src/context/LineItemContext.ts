import { createContext } from 'react'
import { LineItemState } from '../reducers/LineItemReducer'
import { LineItemCollection } from '@commercelayer/js-sdk'

export interface LineItemContextValue extends LineItemState {
  lineItems: LineItemCollection[] | undefined
}

const initial: LineItemContextValue = {
  lineItems: [],
}

const LineItemContext = createContext<LineItemContextValue>(initial)

export default LineItemContext
