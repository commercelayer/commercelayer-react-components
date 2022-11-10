import { createContext } from 'react'
import { LineItem } from '@commercelayer/sdk'

export type InitialLineItemContext = Partial<{
  lineItem: LineItem
}>

const initial: InitialLineItemContext = {}

const LineItemChildrenContext = createContext<InitialLineItemContext>(initial)

export default LineItemChildrenContext
