import baseReducer from '../utils/baseReducer'

export type GiftCardActionType = 'setAvailability'

export interface GiftCardState {
  test: string
}

export interface GiftCardAction {
  type: GiftCardActionType
  payload: GiftCardState
}

export const giftCardInitialState: GiftCardState = {
  test: ''
}

const type: GiftCardActionType[] = ['setAvailability']

const giftCardReducer = (
  state: GiftCardState,
  reducer: GiftCardAction
): GiftCardState =>
  baseReducer<GiftCardState, GiftCardAction, GiftCardActionType[]>(
    state,
    reducer,
    type
  )

export default giftCardReducer
