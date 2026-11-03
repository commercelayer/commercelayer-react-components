import { type JSX, useContext } from "react"
import Parent from "#components/utils/Parent"
import OrderContext from "#context/OrderContext"
import { usePaymentsModel } from "#hooks/usePaymentsModel"
import type { CodeType } from "#reducers/OrderReducer"
import type { ChildrenFunction } from "#typings"
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

export function GiftCardOrCouponCode({ children, type, ...props }: Props): JSX.Element | null {
  const { order, managePaymentProviderGiftCards } = useContext(OrderContext)
  const paymentsModel = usePaymentsModel()
  // On the `payment_sessions` model a gift card is a Payment Session, not an
  // order code, so there is only ever a coupon to display here — including
  // when the consumer explicitly asked for the gift card.
  const isPaymentSessionsModel = paymentsModel === "payment_sessions"
  let codeType = type && !isPaymentSessionsModel ? (`${type}_code` as const) : undefined
  if (isPaymentSessionsModel) codeType = "coupon_code"
  else if (!type && order && "coupon_code" in order && order.coupon_code !== "")
    codeType = "coupon_code"
  else if (!type) codeType = "gift_card_code"
  const code = order && codeType ? order[codeType] : ""
  const hide = !(order && code)
  // The provider-managed gift card lives inside an Adyen payment source, which
  // only the `payment_source` model has.
  if (managePaymentProviderGiftCards && type === "gift_card" && !isPaymentSessionsModel) {
    const giftCardData = manageGiftCard({ order })
    if (!giftCardData) return null
    const displayCode = `${giftCardData.cardBrand} ${giftCardData.cardSummary}`
    const parentProps: ChildrenProps = {
      ...props,
      code: displayCode,
      hide: false,
    }
    return children ? (
      <Parent {...parentProps}>{children}</Parent>
    ) : (
      <span {...props}>{displayCode}</span>
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
