import type { Sku } from "@commercelayer/sdk"
import { createContext } from "react"

export type InitialSkuContext = Partial<{
  sku: Sku
}>

const initial: InitialSkuContext = {}

const SkuChildrenContext = createContext<InitialSkuContext>(initial)

export default SkuChildrenContext
