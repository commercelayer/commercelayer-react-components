import { LineItemCollection } from '@commercelayer/js-sdk'
import baseReducer from '../utils/baseReducer'

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

export interface LineItemAction {
  type: 'setLineItems'
  payload: LineItemState
}

export const lineItemInitialState: LineItemState = {
  lineItems: []
}

export type LineItemActionType = 'setLineItems'

const actionType: LineItemActionType[] = ['setLineItems']

const lineItemReducer = (
  state: LineItemState,
  reducer: LineItemAction
): LineItemState =>
  baseReducer<LineItemState, LineItemAction, LineItemActionType[]>(
    state,
    reducer,
    actionType
  )

export default lineItemReducer
