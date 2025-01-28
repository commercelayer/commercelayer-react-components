import type { BaseReducer } from '#typings'

const baseReducer: BaseReducer = (state, action, actionTypes) => {
  const actions = actionTypes
  if (actions.includes(action.type)) {
    const data = action.payload
    state = { ...state, ...data }
  }
  return state
}

export default baseReducer
