import type { JSX } from "react"
import { CheckoutComWallet, type CheckoutComWalletProps } from "#components/utils/CheckoutComWallet"

export type { PaymentSettingCheckoutComWalletChildrenProps as PaymentSettingCheckoutComGooglePayChildrenProps } from "#components/utils/CheckoutComWallet"

/**
 * Google Pay through Checkout.com, for an order on the `payment_sessions` model.
 *
 * Mounted inside `<PaymentSetting>` beside `<PaymentSettingCheckoutComPayment>`.
 * It renders only when Checkout.com's payment session offers Google Pay and the
 * browser can pay with it, and nothing at all otherwise. The button is
 * Google Pay's own: the gift cards are charged once the shopper confirms in its
 * sheet, and `<PlaceOrderButton>` places the order without a click.
 */
export function PaymentSettingCheckoutComGooglePay(
  props: CheckoutComWalletProps<"googlepay">
): JSX.Element | null {
  return <CheckoutComWallet {...props} method="googlepay" />
}

export default PaymentSettingCheckoutComGooglePay
