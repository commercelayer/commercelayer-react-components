import { createContext } from 'react'
import type { LineItem } from '@commercelayer/sdk'

export type InitialLineItemChildrenContext = Partial<{
  lineItem: LineItem | null | undefined
}>

const initial: InitialLineItemChildrenContext = {}

const LineItemChildrenContext =
  createContext<InitialLineItemChildrenContext>(initial)

export default LineItemChildrenContext
