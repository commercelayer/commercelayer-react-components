import { createContext } from 'react'
import { LineItemState } from '../reducers/LineItemReducer'

const initial: LineItemState = {
  lineItems: []
}

const LineItemContext = createContext(initial)

export default LineItemContext
