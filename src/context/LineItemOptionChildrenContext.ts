import { createContext } from 'react'
import { LineItemOptionCollection } from '@commercelayer/js-sdk'

export interface InitialLineItemContext {
  lineItemOption?: LineItemOptionCollection
}

const initial: InitialLineItemContext = {}

const LineItemOptionChildrenContext = createContext(initial)

export default LineItemOptionChildrenContext
