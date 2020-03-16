import { createContext } from 'react'
import { LineItemCollection } from '@commercelayer/js-sdk'

export interface InitialLineItemContext {
  lineItem?: LineItemCollection
}

const initial: InitialLineItemContext = {}

const LineItemChildrenContext = createContext(initial)

export default LineItemChildrenContext
