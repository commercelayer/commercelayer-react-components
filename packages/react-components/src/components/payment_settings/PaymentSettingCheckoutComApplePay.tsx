import type { JSX } from "react"
import { CheckoutComWallet, type CheckoutComWalletProps } from "#components/utils/CheckoutComWallet"

export type { PaymentSettingCheckoutComWalletChildrenProps as PaymentSettingCheckoutComApplePayChildrenProps } from "#components/utils/CheckoutComWallet"

/**
 * Apple Pay through Checkout.com, for an order on the `payment_sessions` model.
 *
 * Mounted inside `<PaymentSetting>` beside `<PaymentSettingCheckoutComPayment>`.
 * It renders only when Checkout.com's payment session offers Apple Pay and the
 * browser can pay with it, and nothing at all otherwise. The button is
 * Apple Pay's own: the gift cards are charged once the shopper confirms in its
 * sheet, and `<PlaceOrderButton>` places the order without a click.
 *
 * Mounting it is a statement that the domains this checkout is served from are
 * registered for Apple Pay on the Checkout.com account: the button renders on
 * any Safari that can pay, and the payment then fails on a domain that is not.
 */
export function PaymentSettingCheckoutComApplePay(
  props: CheckoutComWalletProps<"applepay">
): JSX.Element | null {
  return <CheckoutComWallet {...props} method="applepay" />
}

export default PaymentSettingCheckoutComApplePay
