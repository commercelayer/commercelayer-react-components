import baseReducer from '../utils/baseReducer'
import { CustomerCollection } from '@commercelayer/js-sdk/dist/resources/Customer'
import { BaseMetadata } from '../@types'
import { MarketCollection } from '@commercelayer/js-sdk'

export type GiftCardActionType = 'setAvailability'

export interface GiftCardRecipient {
  email: string
  firstName?: string
  lastName?: string
  referenceOrigin?: string
  reference?: string
  metadata?: BaseMetadata
  customer?: CustomerCollection
}

export interface GiftCardActionPayload {
  currencyCode?: string
  balanceCent?: number
  balanceMaxCents?: number
  singleUse?: boolean
  rechargeable?: boolean
  imageUrl?: string
  expiresAt?: null | Date
  referenceOrigin?: string
  recipientEmail?: string
  reference?: string
  metadata?: BaseMetadata
  market?: MarketCollection
  giftCardRecipient?: GiftCardRecipient
}

export interface GiftCardState extends GiftCardActionPayload {
  currencyCode: string
  balanceCent: number
}

export interface GiftCardAction {
  type: GiftCardActionType
  payload: GiftCardState
}

export const giftCardInitialState: GiftCardState = {
  currencyCode: '',
  balanceCent: 0,
  singleUse: false,
  rechargeable: true,
  expiresAt: null
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
