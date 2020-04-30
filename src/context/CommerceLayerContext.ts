import { createContext } from 'react'

export interface CommerceLayerConfig {
  accessToken: string
  endpoint: string
  cache: boolean
}

const initial: CommerceLayerConfig = {
  accessToken: '',
  endpoint: '',
  cache: false,
}

const CommerceLayerContext = createContext(initial)

export default CommerceLayerContext
