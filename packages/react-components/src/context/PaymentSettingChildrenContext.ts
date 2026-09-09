import type { PaymentSession, PaymentSetting } from "@commercelayer/sdk"
import { createContext } from "react"
import type { BaseError } from "#typings/errors"

export interface InitialPaymentSettingChildrenContext {
  /** The Payment Setting this subtree renders, from `available_payment_settings`. */
  setting?: PaymentSetting
  /**
   * The Payment Session pointing at this setting, if any. This *is* the
   * selection — the order carries no `payment_setting` relationship — so it
   * survives a reload and always wins over anything held in the browser.
   */
  currentPaymentSession?: PaymentSession
  /** Whether this setting is the shopper's current choice. */
  isSelected?: boolean
  /**
   * Whether a session is being created for this setting right now. This is not
   * the selection: the selection is derived from the order and only becomes
   * true once the API has answered.
   */
  isPending?: boolean
  errors?: BaseError[]
  /** Select this setting, creating or adopting its Payment Session. */
  selectSetting?: () => Promise<void>
  /** Nothing may change — the subtree is a recap, not a form. */
  readonly?: boolean
  /**
   * The `returnUrl` given to `<PaymentSetting>`, for a gateway that needs one
   * at a moment other than session creation.
   *
   * Adyen bakes it into the session it creates and never reads it again, so it
   * goes out with the create attributes. Stripe takes it at confirmation, from
   * whoever calls `confirmPayment` — which is a component nested below this
   * context. Passing it down keeps one public prop rather than one per gateway.
   */
  returnUrl?: string
}

const initial: InitialPaymentSettingChildrenContext = {}

const PaymentSettingChildrenContext = createContext<InitialPaymentSettingChildrenContext>(initial)

export default PaymentSettingChildrenContext
