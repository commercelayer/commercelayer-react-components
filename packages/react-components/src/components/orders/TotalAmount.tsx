import BaseOrderPrice from "../utils/BaseOrderPrice"
import type { BaseAmountComponent } from "#typings"

import { useContext, type JSX } from "react"
import Parent from "#components/utils/Parent"
import OrderContext from "#context/OrderContext"
import { manageGiftCard } from "#utils/adyen/manageGiftCard"

export function TotalAmount(props: BaseAmountComponent): JSX.Element | null {
  const { manageAdyenGiftCard, order } = useContext(OrderContext)
  if (manageAdyenGiftCard) {
    const giftCardData = manageGiftCard({ order })
    if (!giftCardData)
      return <BaseOrderPrice base="total_amount" type="with_taxes" {...props} />
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
