import type { LineItem } from "@commercelayer/sdk"
import { createContext } from "react"
import type { LineItemState } from "#reducers/LineItemReducer"

export interface LineItemContextValue extends LineItemState {
  lineItems?: LineItem[] | null
  reload?: () => Promise<void>
}

const initial: LineItemContextValue = {}

const LineItemContext = createContext<LineItemContextValue>(initial)

export default LineItemContext
