import { type JSX, useContext } from "react"
import Parent from "#components/utils/Parent"
import OrderContext from "#context/OrderContext"
import { usePaymentSessionsState } from "#hooks/usePaymentSessionsState"
import { usePaymentsModel } from "#hooks/usePaymentsModel"
import type { BaseAmountComponent } from "#typings"
import { manageGiftCard } from "#utils/adyen/manageGiftCard"
import { type CurrencyCode, formatCentsToCurrency } from "#utils/currencies"
import BaseOrderPrice from "../utils/BaseOrderPrice"

export function TotalAmount(props: BaseAmountComponent): JSX.Element | null {
  const { managePaymentProviderGiftCards, order } = useContext(OrderContext)
  const paymentsModel = usePaymentsModel()
  const { giftCardAmountCents } = usePaymentSessionsState()

  // On the `payment_sessions` model a gift card is a payment, not a discount, so
  // `total_amount_with_taxes_cents` keeps the gross figure. On the older model
  // the same gift card was a negative line item and the total already came back
  // net — so showing the gross here would be a regression for anyone migrating,
  // and would tell the shopper to pay money a gift card has already covered.
  //
  // Deducting here rather than reading `order.session_amount_cents`: that field
  // does not move until a session is authorized, and gift cards are authorized
  // at place time.
  if (paymentsModel === "payment_sessions" && giftCardAmountCents > 0) {
    // Net of the gift cards only, not of everything already authorized: on the
    // older model an authorized payment source never reduced the total shown,
    // and only the gift card did. This keeps the two models saying the same
    // thing.
    const netCents = Math.max(0, (order?.total_amount_with_taxes_cents ?? 0) - giftCardAmountCents)
    const price = formatCentsToCurrency(netCents, order?.currency_code as CurrencyCode)
    const parentProps = { price, priceCents: netCents, ...props }
    return props.children ? (
      <Parent {...parentProps}>{props.children}</Parent>
    ) : (
      <span {...props}>{price}</span>
    )
  }

  if (managePaymentProviderGiftCards) {
    const giftCardData = manageGiftCard({ order })
    if (!giftCardData) return <BaseOrderPrice base="total_amount" type="with_taxes" {...props} />
    const parentProps = {
      price: `${giftCardData?.formattedOrderTotal}`,
      ...props,
    }
    return props.children ? (
      <Parent {...parentProps}>{props.children}</Parent>
    ) : (
      <span {...props}>{`${giftCardData?.formattedOrderTotal}`}</span>
    )
  }
  return <BaseOrderPrice base="total_amount" type="with_taxes" {...props} />
}

export default TotalAmount
