import { createContext } from 'react'
import type { LineItemOption } from '@commercelayer/sdk'

export interface InitialLineItemContext {
  lineItemOption: Partial<
    Omit<LineItemOption, 'options'> & { options?: Record<string, string> }
  >
  showAll?: boolean
}

const initial: InitialLineItemContext = {
  lineItemOption: {}
}

const LineItemOptionChildrenContext =
  createContext<InitialLineItemContext>(initial)

export default LineItemOptionChildrenContext
