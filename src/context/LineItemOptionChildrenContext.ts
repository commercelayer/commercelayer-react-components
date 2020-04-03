import { createContext } from 'react'
import { LineItemOptionCollection } from '@commercelayer/js-sdk'

export interface InitialLineItemContext {
  lineItemOption: LineItemOptionCollection | {}
}

const initial: InitialLineItemContext = {
  lineItemOption: {},
}

const LineItemOptionChildrenContext = createContext<InitialLineItemContext>(
  initial
)

export default LineItemOptionChildrenContext
