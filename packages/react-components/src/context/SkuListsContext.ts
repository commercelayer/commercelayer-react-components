import type { Sku } from "@commercelayer/sdk"
import { createContext } from "react"

export interface SkuListsContextType {
  listIds: string[]
  skuLists: Record<string, Sku[]>
  registerListId: (id: string) => void
}

const defaultContext: SkuListsContextType = {
  listIds: [],
  skuLists: {},
  registerListId: () => {},
}

export const SkuListsContext =
  createContext<SkuListsContextType>(defaultContext)

export default SkuListsContext
