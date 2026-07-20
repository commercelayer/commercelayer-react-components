import type { LineItemOption } from "@commercelayer/sdk"
import { createContext } from "react"

export interface TLineItemOptions extends LineItemOption {}

export interface InitialLineItemContext {
  lineItemOption: Partial<TLineItemOptions>
  showAll?: boolean
}

const initial: InitialLineItemContext = {
  lineItemOption: {},
}

const LineItemOptionChildrenContext = createContext<InitialLineItemContext>(initial)

export default LineItemOptionChildrenContext
