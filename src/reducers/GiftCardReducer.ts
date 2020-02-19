import baseReducer from '../utils/baseReducer'
import { CustomerCollection } from '@commercelayer/js-sdk'
import { BaseMetadata } from '../@types'
import CLayer, {
  MarketCollection,
  GiftCardRecipientCollection
} from '@commercelayer/js-sdk'
import { Dispatch } from 'react'
import { CommerceLayerConfig } from '../context/CommerceLayerContext'
import _ from 'lodash'

export type GiftCardActionType = 'setAvailability' | 'setGiftCardRecipient'

export interface GiftCardRecipientI {
  email: string
  firstName?: string
  lastName?: string
  referenceOrigin?: string
  reference?: string
  metadata?: BaseMetadata
  customer?: CustomerCollection
}

export interface GiftCardI {
  currencyCode?: string
  balanceCent?: number
  balanceMaxCents?: number
  singleUse?: boolean
  rechargeable?: boolean
  imageUrl?: string
  expiresAt?: null | Date
  firstName?: string
  lastName?: string
  email?: string
  referenceOrigin?: string
  recipientEmail?: string
  reference?: string
  metadata?: BaseMetadata
}

export interface GiftCardActionPayload extends GiftCardI {
  market?: MarketCollection
  giftCardRecipient?: GiftCardRecipientCollection
}

export interface GiftCardState extends GiftCardActionPayload {
  currencyCode: string
  balanceCent: number
  addGiftCardRecipient?: (values: GiftCardRecipientI & object) => void
  addGiftCard?: (values: GiftCardI & object) => void
}

export interface GiftCardAction {
  type: GiftCardActionType
  payload: GiftCardActionPayload
}

export const giftCardInitialState: GiftCardState = {
  currencyCode: '',
  balanceCent: 0,
  singleUse: false,
  rechargeable: true,
  expiresAt: null
}

export interface AddGiftCardRecipient {
  <V extends GiftCardRecipientI>(
    values: V,
    config: CommerceLayerConfig,
    dispatch: Dispatch<GiftCardAction>
  ): void
}

export interface AddGiftCard {
  <V extends GiftCardI>(
    values: V,
    config: CommerceLayerConfig,
    dispatch: Dispatch<GiftCardAction>
  ): void
}

export const addGiftCardRecipient: AddGiftCardRecipient = async (
  values,
  config,
  dispatch
) => {
  try {
    const recipient = await CLayer.GiftCardRecipient.withCredentials(
      config
    ).create(values)
    dispatch({
      type: 'setGiftCardRecipient',
      payload: {
        giftCardRecipient: recipient
      }
    })
  } catch (error) {
    console.error(error)
  }
}

export const addGiftCard: AddGiftCard = async (values, config, dispatch) => {
  try {
    const { firstName, lastName, email, ...val } = values
    const giftCardValue = {
      recipientEmail: email,
      ...val
    } as GiftCardI
    const recipientValues = {}
    const giftCard = await CLayer.GiftCard.withCredentials(config)
      .includes('giftCardRecipient')
      .create(giftCardValue)
    if (firstName) recipientValues['firstName'] = firstName
    if (lastName) recipientValues['lastName'] = lastName
    if (!_.isEmpty(recipientValues)) {
      await giftCard
        .withCredentials(config)
        .giftCardRecipient()
        .update(recipientValues)
    }
    dispatch({
      type: 'setGiftCardRecipient',
      payload: {
        ...giftCardValue
      }
    })
  } catch (error) {
    console.error(error)
  }
}

const type: GiftCardActionType[] = ['setAvailability', 'setGiftCardRecipient']

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
