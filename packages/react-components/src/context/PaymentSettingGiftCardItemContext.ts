import type { PaymentSession } from "@commercelayer/sdk"
import { createContext } from "react"

export interface InitialPaymentSettingGiftCardItemContext {
  /** The Payment Session this row represents. */
  paymentSession?: PaymentSession
  /** The code the shopper typed, as the API stores it on the session. */
  code?: string | null
  /**
   * How much of the order this card covers, already formatted by the API. Note
   * this is *not* the card's balance: the server caps the session at whatever
   * was still owed, and the balance is not served on a session at all.
   */
  formattedAmount?: string | null
  amountCents?: number | null
  /**
   * Whether this card can still be taken off the order. False once it has been
   * charged: authorizing a gift card debits the balance immediately, and only a
   * refund could give it back — which this iteration does not implement.
   */
  isRemovable?: boolean
  /** A removal is in flight for this row. */
  isRemoving?: boolean
  /** Take this gift card off the order. */
  removeGiftCard?: () => Promise<void>
}

const initial: InitialPaymentSettingGiftCardItemContext = {}

const PaymentSettingGiftCardItemContext =
  createContext<InitialPaymentSettingGiftCardItemContext>(initial)

export default PaymentSettingGiftCardItemContext
