import type { GiftCardRemoval } from "@commercelayer/core-components"
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
   * How this card can be taken off the order, if it can at all.
   *
   * `discard` — nothing was charged, so the Payment Session is deleted and no
   * balance moves. `refund` — the card was charged, so the only way back is a
   * `PaymentRefund`: slower, and a real accounting record. **Absent** — it
   * cannot be taken off, because the subtree is readonly, because the order has
   * left `pending` (where a storefront token has no refund grant at all), or
   * because the charge is still settling and neither route is open yet.
   *
   * Which operation runs is not the consumer's choice — `removeGiftCard` is one
   * entry point and the library decides. This is here so an application can
   * word the two differently, confirm the second, or explain its latency.
   */
  removal?: GiftCardRemoval
  /**
   * A removal is in flight for this row.
   *
   * Worth rendering: a `discard` is one request, but a `refund` waits on a
   * background job and then polls for it.
   */
  isRemoving?: boolean
  /** Take this gift card off the order, whichever way `removal` says. */
  removeGiftCard?: () => Promise<void>
}

const initial: InitialPaymentSettingGiftCardItemContext = {}

const PaymentSettingGiftCardItemContext =
  createContext<InitialPaymentSettingGiftCardItemContext>(initial)

export default PaymentSettingGiftCardItemContext
