import { createContext } from 'react'
import { LineItemState } from '../reducers/LineItemReducer'
import { LineItemCollection } from '@commercelayer/js-sdk'

interface LineItemContext extends LineItemState {
  lineItems: LineItemCollection[]
}

const initial: LineItemContext = {
  lineItems: []
}

const LineItemContext = createContext<LineItemContext>(initial)

export default LineItemContext
