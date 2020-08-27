import baseReducer from '../utils/baseReducer'
import { CustomerCollection } from '@commercelayer/js-sdk'
import { BaseMetadata } from '../typings'
import CLayer, {
  MarketCollection,
  GiftCardRecipientCollection,
} from '@commercelayer/js-sdk'
import { Dispatch } from 'react'
import { CommerceLayerConfig } from '../context/CommerceLayerContext'
import _ from 'lodash'
import getErrorsByCollection from '../utils/getErrorsByCollection'
import { BaseError } from '../typings/errors'

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
  orderId?: string
}

export interface GiftCardActionPayload extends GiftCardI {
  market?: MarketCollection
  giftCardRecipient?: GiftCardRecipientCollection
  errors?: BaseError[]
  loading?: boolean
}

export interface GiftCardState extends GiftCardActionPayload {
  currencyCode: string
  balanceCent: number
  addGiftCardRecipient?: (values: GiftCardRecipientI & object) => void
  addGiftCard?: (values: GiftCardI & object) => void
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
  errors: [],
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
    configParameters: {
      getOrder?: (id: string) => void
      createOrder?: () => Promise<string>
      config: CommerceLayerConfig
      dispatch: Dispatch<GiftCardAction>
    }
  ): void
}

export interface AddGiftCardError {
  <V extends BaseError[]>(errors: V, dispatch: Dispatch<GiftCardAction>): void
}

export interface AddGiftCardLoading {
  <V extends boolean>(loading: V, dispatch: Dispatch<GiftCardAction>): void
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
        giftCardRecipient: recipient,
      },
    })
  } catch (error) {
    console.error(error)
  }
}

export const addGiftCardLoading: AddGiftCardLoading = (loading, dispatch) => {
  dispatch({
    type: 'setGiftCardLoading',
    payload: {
      loading,
    },
  })
}

export const addGiftCard: AddGiftCard = async (
  values,
  { config, dispatch, getOrder, createOrder }
) => {
  try {
    addGiftCardLoading(true, dispatch)
    const { firstName, lastName, email, orderId, ...val } = values
    const giftCardValue = {
      recipientEmail: email,
      ...val,
    } as GiftCardI
    const recipientValues = {}
    const giftCard = await CLayer.GiftCard.withCredentials(config).create(
      giftCardValue
    )
    if (firstName) recipientValues['firstName'] = firstName
    if (lastName) recipientValues['lastName'] = lastName
    if (!_.isEmpty(recipientValues)) {
      await (await giftCard.withCredentials(config).giftCardRecipient()).update(
        recipientValues
      )
    }
    if (createOrder && getOrder) {
      const id = orderId || (await createOrder())
      if (id) {
        const order = CLayer.Order.build({ id })
        const item = CLayer.GiftCard.build({ id: giftCard.id })
        await CLayer.LineItem.withCredentials(config).create({
          quantity: 1,
          order,
          item,
        })
        getOrder && getOrder(id)
      }
    }
    dispatch({
      type: 'setGiftCardRecipient',
      payload: {
        ...giftCardValue,
      },
    })
    addGiftCardLoading(false, dispatch)
  } catch (r) {
    const errors = getErrorsByCollection(r, 'giftCard')
    dispatch({
      type: 'setGiftCardErrors',
      payload: {
        errors,
      },
    })
    addGiftCardLoading(false, dispatch)
  }
}

export const addGiftCardError: AddGiftCardError = (errors, dispatch) => {
  dispatch({
    type: 'setGiftCardErrors',
    payload: {
      errors,
    },
  })
}

const type: GiftCardActionType[] = [
  'setAvailability',
  'setGiftCardRecipient',
  'setGiftCardErrors',
  'setGiftCardLoading',
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
