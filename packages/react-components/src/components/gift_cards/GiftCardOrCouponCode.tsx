import { useContext, type JSX } from "react"
import type { ChildrenFunction } from "#typings"
import Parent from "#components/utils/Parent"
import OrderContext from "#context/OrderContext"
import type { CodeType } from "#reducers/OrderReducer"
import { manageGiftCard } from "#utils/adyen/manageGiftCard"

interface ChildrenProps extends Omit<Props, "children" | "type"> {
  code?: string | null
  hide?: boolean
  discountAmountCents?: number | null
  discountAmountFloat?: number | null
  formattedDiscountAmount?: string | null
}

interface Props extends Omit<JSX.IntrinsicElements["span"], "children"> {
  type?: CodeType
  children?: ChildrenFunction<ChildrenProps>
}

export function GiftCardOrCouponCode({
  children,
  type,
  ...props
}: Props): JSX.Element | null {
  const { order, manageAdyenGiftCard } = useContext(OrderContext)
  let codeType = type ? (`${type}_code` as const) : undefined
  if (!type && order && "coupon_code" in order && order.coupon_code !== "")
    codeType = "coupon_code"
  else if (!type) codeType = "gift_card_code"
  const code = order && codeType ? order[codeType] : ""
  let hide = !(order && code)
  if (manageAdyenGiftCard && type === "gift_card") {
    const giftCardData = manageGiftCard({ order })
    if (!giftCardData) return null
    hide = false
    const parentProps: ChildrenProps = {
      ...props,
      code: `${giftCardData.cardBrand} ${giftCardData.cardSummary}`,
      hide,
    }
    return children ? (
      <Parent {...parentProps}>{children}</Parent>
    ) : hide ? null : (
      <span {...props}>{code}</span>
    )
  }
  const parentProps: ChildrenProps = {
    ...props,
    code,
    hide,
    discountAmountCents: order?.discount_amount_cents,
    discountAmountFloat: order?.discount_amount_float,
    formattedDiscountAmount: order?.formatted_discount_amount,
  }
  return children ? (
    <Parent {...parentProps}>{children}</Parent>
  ) : hide ? null : (
    <span {...props}>{code}</span>
  )
}

export default GiftCardOrCouponCode
