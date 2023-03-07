import { createContext } from 'react'
import { LineItemOption } from '@commercelayer/sdk'

export interface InitialLineItemContext {
  lineItemOption: Partial<LineItemOption>
  showAll?: boolean
}

const initial: InitialLineItemContext = {
  lineItemOption: {}
}

const LineItemOptionChildrenContext =
  createContext<InitialLineItemContext>(initial)

export default LineItemOptionChildrenContext
