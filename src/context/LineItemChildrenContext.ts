import { createContext } from 'react'
import { LineItem } from '@commercelayer/sdk'

export interface InitialLineItemContext {
  lineItem: LineItem | Record<string, any>
}

const initial: InitialLineItemContext = {
  lineItem: {},
}

const LineItemChildrenContext = createContext<InitialLineItemContext>(initial)

export default LineItemChildrenContext
