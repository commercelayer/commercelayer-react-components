import { createContext } from 'react'
import type { LineItemOption } from '@commercelayer/sdk'

export interface TLineItemOptions extends LineItemOption {}

export interface InitialLineItemContext {
  lineItemOption: Partial<TLineItemOptions>
  showAll?: boolean
}

const initial: InitialLineItemContext = {
  lineItemOption: {}
}

const LineItemOptionChildrenContext =
  createContext<InitialLineItemContext>(initial)

export default LineItemOptionChildrenContext
