import { useReducer } from 'react'

const reducer = (state, action) => {
  switch (action.type) {
    case 'setToken':
      return {
        accessToken: action.accessToken,
        endpoint: action.endpoit,
        ...state
      }
    default:
      throw new Error(`${action.type} is not available`)
  }
}

const initialState = {
  accessToken: '',
  initSDK: false
}

const useGlobalState: any = () => {
  const [state, dispatch] = useReducer(reducer, initialState)
  return {
    state,
    dispatch
  }
}

export default useGlobalState
