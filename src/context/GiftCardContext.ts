import { createContext } from 'react'
import {
  giftCardInitialState,
  GiftCardState,
  GiftCardRecipientI,
  GiftCardI
} from '../reducers/GiftCardReducer'
import { BaseError } from '../@types/errors'

export interface GCContext extends GiftCardState {
  addGiftCardRecipient: (values: GiftCardRecipientI & object) => void
  addGiftCard: (values: GiftCardI & object) => void
  addGiftCardError: (errors: BaseError[]) => void
  addGiftCardLoading: (loading: boolean) => void
}

const GiftCardContext = createContext(giftCardInitialState as GCContext)

export default GiftCardContext
