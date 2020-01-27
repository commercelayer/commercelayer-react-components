import { createContext } from 'react'
import { LineItemCollection } from '@commercelayer/js-sdk'

export interface InitialLineItemContext {
  lineItem?: LineItemCollection | null
}

const initial: InitialLineItemContext = {}

const LineItemChildrenContext = createContext(initial)

export default LineItemChildrenContext
