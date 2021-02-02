import { createContext } from 'react'
import { LineItemCollection } from '@commercelayer/js-sdk'

export interface InitialLineItemContext {
  lineItem: LineItemCollection | Record<string, any>
}

const initial: InitialLineItemContext = {
  lineItem: {},
}

const LineItemChildrenContext = createContext<InitialLineItemContext>(initial)

export default LineItemChildrenContext
