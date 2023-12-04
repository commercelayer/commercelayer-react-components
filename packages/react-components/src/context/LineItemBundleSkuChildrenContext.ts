import { createContext } from 'react'
import { type SkuListItem } from '@commercelayer/sdk'

export type InitialLineItemBundleSkuChildrenContext = Partial<{
  skuListItem: SkuListItem | null | undefined
}>

const initial: InitialLineItemBundleSkuChildrenContext = {}

const LineItemBundleChildrenContext =
  createContext<InitialLineItemBundleSkuChildrenContext>(initial)

export default LineItemBundleChildrenContext
