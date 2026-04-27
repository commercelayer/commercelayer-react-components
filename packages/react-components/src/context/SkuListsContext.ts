import type { Sku } from "@commercelayer/sdk"
import { createContext } from "react"

export interface SkuListsContextType {
  listIds: string[]
  skuLists: Record<string, Sku[]>
  registerListId: (id: string) => void
  /**
   * Set by `SkuListsContainer` when present. `undefined` means standalone mode
   * (no container parent) — used by `SkuList` for standalone detection.
   */
  setListIds?: (ids: string[]) => void
}

const defaultContext: SkuListsContextType = {
  listIds: [],
  skuLists: {},
  registerListId: () => {},
}

export const SkuListsContext =
  createContext<SkuListsContextType>(defaultContext)

export default SkuListsContext
