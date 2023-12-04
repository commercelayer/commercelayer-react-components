import { createContext } from 'react'
import { type LineItem, type SkuList } from '@commercelayer/sdk'

export type InitialLineItemBundleChildrenContext = Partial<{
  skuListItems: SkuList['sku_list_items'] | null | undefined
  lineItem: LineItem | null | undefined
}>

const initial: InitialLineItemBundleChildrenContext = {}

const LineItemBundleChildrenContext =
  createContext<InitialLineItemBundleChildrenContext>(initial)

export default LineItemBundleChildrenContext
