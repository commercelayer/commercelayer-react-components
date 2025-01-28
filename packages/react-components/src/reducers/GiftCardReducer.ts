/* eslint-disable @typescript-eslint/no-unsafe-argument */
import baseReducer from '#utils/baseReducer'
import type {
  Customer,
  Market,
  GiftCardRecipient,
  GiftCardRecipientCreate,
  Order,
  GiftCardRecipientUpdate
} from '@commercelayer/sdk'
import type { BaseMetadata } from '#typings'
import type { Dispatch } from 'react'
import type { CommerceLayerConfig } from '#context/CommerceLayerContext'
import isEmpty from 'lodash/isEmpty'
import type { BaseError } from '#typings/errors'
import getErrors from '#utils/getErrors'
import getSdk from '#utils/getSdk'
import type {
  createOrder as makeOrder,
  getOrderContext
} from '#reducers/OrderReducer'

export type GiftCardActionType =
  | 'setAvailability'
  | 'setGiftCardRecipient'
  | 'setGiftCardErrors'
  | 'setGiftCardLoading'

export interface GiftCardRecipientI {
  email: string
  firstName?: string
  lastName?: string
  referenceOrigin?: string
  reference?: string
  metadata?: BaseMetadata
  customer?: Customer
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
  orderId?: string
}

export interface GiftCardActionPayload extends GiftCardI {
  market?: Market
  giftCardRecipient?: GiftCardRecipient
  errors?: BaseError[]
  loading?: boolean
}

export interface GiftCardState extends GiftCardActionPayload {
  currencyCode: string
  balanceCent: number
  addGiftCardRecipient?: (
    values: GiftCardRecipientI & Record<string, any>
  ) => void
  addGiftCard?: (values: GiftCardI & Record<string, any>) => void
  addGiftCardError?: (errors: BaseError[]) => void
  addGiftCardLoading?: (loading: boolean) => void
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
  loading: false,
  expiresAt: null,
  errors: []
}

export type AddGiftCardError = <V extends BaseError[]>(
  errors: V,
  dispatch: Dispatch<GiftCardAction>
) => void

export type AddGiftCardLoading = <V extends boolean>(
  loading: V,
  dispatch: Dispatch<GiftCardAction>
) => void

export async function addGiftCardRecipient<V extends GiftCardRecipientCreate>(
  values: V,
  config: CommerceLayerConfig,
  dispatch: Dispatch<GiftCardAction>
): Promise<void> {
  try {
    const sdk = getSdk(config)
    const recipient = await sdk.gift_card_recipients.create(values)
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

export const addGiftCardLoading: AddGiftCardLoading = (loading, dispatch) => {
  dispatch({
    type: 'setGiftCardLoading',
    payload: {
      loading
    }
  })
}

export async function addGiftCard<V extends GiftCardI>(
  values: V,
  {
    config,
    dispatch,
    getOrder,
    createOrder,
    order
  }: {
    getOrder?: getOrderContext
    createOrder?: typeof makeOrder
    config: CommerceLayerConfig
    dispatch: Dispatch<GiftCardAction>
    order?: Order
  }
): Promise<void> {
  try {
    const sdk = getSdk(config)
    addGiftCardLoading(true, dispatch)
    const { firstName, lastName, email, ...val } = values
    // TODO: Change any type
    const giftCardValue: any = {
      recipient_email: email,
      ...val
    }
    const giftCard = await sdk.gift_cards.create(giftCardValue, {
      include: ['gift_card_recipient']
    })
    const recipientValues: GiftCardRecipientUpdate = {
      id: giftCard.gift_card_recipient?.id ?? ''
    }
    if (firstName) recipientValues.first_name = firstName
    if (lastName) recipientValues.last_name = lastName
    if (!isEmpty(recipientValues)) {
      await sdk.gift_card_recipients.update(recipientValues)
    }
    if (createOrder && getOrder) {
      const id = order ? order.id : await createOrder({})
      if (id) {
        const order = sdk.orders.relationship(id)
        const item = sdk.gift_cards.relationship(giftCard.id)
        await sdk.line_items.create({
          quantity: 1,
          order,
          item
        })
        await getOrder(id)
      }
    }
    dispatch({
      type: 'setGiftCardRecipient',
      payload: {
        ...giftCardValue
      }
    })
    addGiftCardLoading(false, dispatch)
  } catch (error: any) {
    const errors = getErrors({ error, resource: 'gift_cards' })
    dispatch({
      type: 'setGiftCardErrors',
      payload: {
        errors
      }
    })
    addGiftCardLoading(false, dispatch)
  }
}

export const addGiftCardError: AddGiftCardError = (errors, dispatch) => {
  dispatch({
    type: 'setGiftCardErrors',
    payload: {
      errors
    }
  })
}

const type: GiftCardActionType[] = [
  'setAvailability',
  'setGiftCardRecipient',
  'setGiftCardErrors',
  'setGiftCardLoading'
]

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
