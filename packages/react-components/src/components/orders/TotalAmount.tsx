import { type JSX, useContext } from "react"
import Parent from "#components/utils/Parent"
import OrderContext from "#context/OrderContext"
import type { BaseAmountComponent } from "#typings"
import { manageGiftCard } from "#utils/adyen/manageGiftCard"
import BaseOrderPrice from "../utils/BaseOrderPrice"

export function TotalAmount(props: BaseAmountComponent): JSX.Element | null {
  const { managePaymentProviderGiftCards, order } = useContext(OrderContext)
  if (managePaymentProviderGiftCards) {
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
