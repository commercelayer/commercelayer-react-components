import { LineItemCollection } from '@commercelayer/js-sdk'
import { BaseReducer } from '../@types/index'

export interface UpdateLineItem {
  (lineItemId: string, quantity: number): void
}

export interface DeleteLineItem {
  (lineItemId: string): void
}

export interface LineItemState {
  lineItems: LineItemCollection[]
  updateLineItem?: UpdateLineItem
  deleteLineItem?: DeleteLineItem
}

export interface LineItemActions {
  type: 'setLineItems'
  lineItems: LineItemCollection[]
}

export const lineItemInitialState: LineItemState = {
  lineItems: []
}

const lineItemReducer: BaseReducer<LineItemState, LineItemActions> = (
  state,
  action
) => {
  if (action.type === 'setLineItems') {
    state = { ...state, lineItems: action.lineItems }
  }
  return state
}

export default lineItemReducer
