import { type JSX, useContext } from "react"
import Parent from "#components/utils/Parent"
import OrderContext from "#context/OrderContext"
import { usePaymentSessionsState } from "#hooks/usePaymentSessionsState"
import { usePaymentsModel } from "#hooks/usePaymentsModel"
import type { BaseAmountComponent } from "#typings"
import { manageGiftCard } from "#utils/adyen/manageGiftCard"
import { type CurrencyCode, formatCentsToCurrency } from "#utils/currencies"
import BaseOrderPrice from "../utils/BaseOrderPrice"

export function GiftCardAmount(props: BaseAmountComponent): JSX.Element | null {
  const { managePaymentProviderGiftCards, order } = useContext(OrderContext)
  const paymentsModel = usePaymentsModel()
  const { giftCardAmountCents } = usePaymentSessionsState()

  // The gift cards on this model are Payment Sessions, not a negative line
  // item, so `order.gift_card_amount_cents` stays at zero and this has to sum
  // the sessions instead. Shown as a deduction to match the older model, where
  // the same money did reduce the order total.
  if (paymentsModel === "payment_sessions") {
    if (giftCardAmountCents === 0) return null
    const price = `-${formatCentsToCurrency(giftCardAmountCents, order?.currency_code as CurrencyCode)}`
    const parentProps = { price, priceCents: -giftCardAmountCents, ...props }
    return props.children ? (
      <Parent {...parentProps}>{props.children}</Parent>
    ) : (
      <span {...props}>{price}</span>
    )
  }

  if (managePaymentProviderGiftCards) {
    const giftCardData = manageGiftCard({ order })
    if (!giftCardData) return null
    const parentProps = {
      priceCents: giftCardData.currentBalanceValue,
      price: `-${giftCardData?.formattedBalanceValue}`,
      ...props,
    }
    return props.children ? (
      <Parent {...parentProps}>{props.children}</Parent>
    ) : (
      <span {...props}>{`-${giftCardData?.formattedBalanceValue}`}</span>
    )
  }
  return <BaseOrderPrice base="amount" type="gift_card" {...props} />
}

export default GiftCardAmount
