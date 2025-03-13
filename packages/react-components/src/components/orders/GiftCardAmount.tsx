import BaseOrderPrice from "../utils/BaseOrderPrice"
import type { BaseAmountComponent } from "#typings"

import { useContext, type JSX } from "react"
import OrderContext from "#context/OrderContext"
import { manageGiftCard } from "#utils/adyen/manageGiftCard"
import Parent from "#components/utils/Parent"

export function GiftCardAmount(props: BaseAmountComponent): JSX.Element | null {
  const { manageAdyenGiftCard, order } = useContext(OrderContext)
  if (manageAdyenGiftCard) {
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
