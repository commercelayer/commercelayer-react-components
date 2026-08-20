import type { PaymentSession } from "@commercelayer/sdk"
import { createContext } from "react"
import type { BaseError } from "#typings/errors"

export interface InitialPaymentSettingGiftCardContext {
  /** Gift cards applied to the order, oldest first. */
  giftCardSessions?: PaymentSession[]
  /** Sum of the applied gift cards, at face value. */
  giftCardAmountCents?: number
  /** What is still owed after the applied gift cards. */
  remainingAmountCents?: number
  /** True when the gift cards cover the order outright. */
  isCovered?: boolean
  /**
   * Whether another gift card may be applied. False once the order is covered,
   * and false once anything has been authorized — settling a partially-paid
   * order is not implemented.
   */
  canAddGiftCard?: boolean
  /** Whether the shopper has asked for the input, or it is showing by default. */
  isInputVisible?: boolean
  /** Show the input. Used by the "add another" control. */
  showInput?: () => void
  /** A code is being applied right now. */
  isApplying?: boolean
  /**
   * The code being typed.
   *
   * Held here rather than inside the input because the submit control is a
   * separate component and needs to read it. The alternative the older gift
   * card form uses — a `<form>` reading the DOM on submit — is not available
   * here: this subtree sits inside a payment step that may already be in a
   * form, and nested forms are invalid.
   */
  code?: string
  setCode?: (code: string) => void
  /**
   * Gift card errors only. Kept apart from the method's errors: the two
   * families have separate UIs, so a failure in one must never surface under
   * the other.
   */
  errors?: BaseError[]
  /** Apply a gift card code to the order. */
  applyGiftCard?: (code: string) => Promise<void>
  /** Take one of the applied gift cards off the order. */
  removeGiftCard?: (paymentSessionId: string) => Promise<void>
  /** Nothing may be applied or removed — a placed order, for instance. */
  readonly?: boolean
}

const initial: InitialPaymentSettingGiftCardContext = {}

const PaymentSettingGiftCardContext = createContext<InitialPaymentSettingGiftCardContext>(initial)

export default PaymentSettingGiftCardContext
