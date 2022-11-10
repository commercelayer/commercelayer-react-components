import { createContext } from 'react'

export interface CommerceLayerConfig {
  accessToken?: string
  endpoint?: string
}

const initial: CommerceLayerConfig = {}

const CommerceLayerContext = createContext(initial)

export default CommerceLayerContext
