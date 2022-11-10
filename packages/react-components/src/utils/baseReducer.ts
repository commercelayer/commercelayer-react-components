import { BaseReducer } from '#typings'

const baseReducer: BaseReducer = (state, action, actionTypes) => {
  const actions = actionTypes
  if (actions.indexOf(action.type) !== -1) {
    const data = action.payload
    state = { ...state, ...data }
  }
  return state
}

export default baseReducer
