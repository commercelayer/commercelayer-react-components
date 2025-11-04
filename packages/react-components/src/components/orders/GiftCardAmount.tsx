import { type JSX, useContext } from "react"
import Parent from "#components/utils/Parent"
import OrderContext from "#context/OrderContext"
import type { BaseAmountComponent } from "#typings"
import { manageGiftCard } from "#utils/adyen/manageGiftCard"
import BaseOrderPrice from "../utils/BaseOrderPrice"

export function GiftCardAmount(props: BaseAmountComponent): JSX.Element | null {
  const { managePaymentProviderGiftCards, order } = useContext(OrderContext)
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
