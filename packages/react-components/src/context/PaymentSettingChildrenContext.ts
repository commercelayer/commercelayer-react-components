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
}

const initial: InitialPaymentSettingChildrenContext = {}

const PaymentSettingChildrenContext = createContext<InitialPaymentSettingChildrenContext>(initial)

export default PaymentSettingChildrenContext
