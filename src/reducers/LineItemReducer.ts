import { LineItemCollection } from '@commercelayer/js-sdk'
import baseReducer from '../utils/baseReducer'
import { BaseError } from '../components/Errors'

export interface UpdateLineItem {
  (lineItemId: string, quantity: number): void
}

export interface DeleteLineItem {
  (lineItemId: string): void
}

export interface LineItemPayload {
  lineItems?: LineItemCollection[]
  errors?: BaseError[]
}

export interface LineItemState extends LineItemPayload {
  updateLineItem?: UpdateLineItem
  deleteLineItem?: DeleteLineItem
}

export interface LineItemAction {
  type: LineItemActionType
  payload: LineItemPayload
}

export const lineItemInitialState: LineItemState = {
  lineItems: [],
  errors: []
}

export type LineItemActionType = 'setLineItems' | 'setErrors'

const actionType: LineItemActionType[] = ['setLineItems', 'setErrors']

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
