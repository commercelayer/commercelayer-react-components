import { createContext } from 'react'

export interface CommerceLayerConfig {
  accessToken: string
  endpoint: string
}

const initial: CommerceLayerConfig = {
  accessToken: '',
  endpoint: ''
}

const CommerceLayerContext = createContext(initial)

export default CommerceLayerContext
