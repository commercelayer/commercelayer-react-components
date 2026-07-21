import type { InterceptorManager } from "@commercelayer/core-components"
import { createContext } from "react"

export interface CommerceLayerConfig {
  accessToken?: string
  interceptors?: InterceptorManager
}

const initial: CommerceLayerConfig = {}

const CommerceLayerContext = createContext(initial)

export default CommerceLayerContext
