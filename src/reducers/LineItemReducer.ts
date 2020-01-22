import { LineItemCollection } from '@commercelayer/js-sdk'
import { GeneralReducer } from '../@types/index'

export interface LineItemState {
  lineItems: LineItemCollection[]
}

export interface LineItemActions {
  type: 'setLineItems'
  lineItems: LineItemCollection[]
}

export const lineItemInitialState: LineItemState = {
  lineItems: []
}

const lineItemReducer: GeneralReducer<LineItemState, LineItemActions> = (
  state,
  action
) => {
  if (action.type === 'setLineItems') {
    state = { ...state, lineItems: action.lineItems }
  }
  return state
}

export default lineItemReducer
