import { createContext } from "react"
import type { GiftCardRecipient, Market } from "@commercelayer/sdk"
import type { BaseMetadata } from "#typings"
import type { BaseError } from "#typings/errors"

export interface GiftCardRecipientI {
  email: string
  firstName?: string
  lastName?: string
  referenceOrigin?: string
  reference?: string
  metadata?: BaseMetadata
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

export interface GiftCardState {
  currencyCode: string
  balanceCent: number
  singleUse?: boolean
  rechargeable?: boolean
  imageUrl?: string
  expiresAt?: null | Date
  referenceOrigin?: string
  recipientEmail?: string
  reference?: string
  metadata?: BaseMetadata
  market?: Market
  giftCardRecipient?: GiftCardRecipient
  errors?: BaseError[]
  loading?: boolean
  addGiftCardRecipient?: (values: GiftCardRecipientI & Record<string, unknown>) => void
  addGiftCard?: (values: GiftCardI & Record<string, unknown>) => void
  addGiftCardError?: (errors: BaseError[]) => void
  addGiftCardLoading?: (loading: boolean) => void
}

export const giftCardInitialState: GiftCardState = {
  currencyCode: "",
  balanceCent: 0,
  singleUse: false,
  rechargeable: true,
  loading: false,
  expiresAt: null,
  errors: [],
}

export interface GCContext extends GiftCardState {
  addGiftCardRecipient: (values: GiftCardRecipientI & object) => void
  addGiftCard: (values: GiftCardI & object) => void
  addGiftCardError: (errors: BaseError[]) => void
  addGiftCardLoading: (loading: boolean) => void
}

const GiftCardContext = createContext(giftCardInitialState as GCContext)

export default GiftCardContext
