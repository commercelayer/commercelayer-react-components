import { createContext } from 'react'

const initial = {
  accessToken: '',
  endpoint: ''
}

const CommerceLayerContext = createContext(initial)

export default CommerceLayerContext
