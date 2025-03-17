import { type ReactNode, useContext, type JSX } from "react"
import Parent from "#components/utils/Parent"
import type { ChildrenFunction } from "#typings/index"
import OrderContext from "#context/OrderContext"
import type { CodeType, OrderCodeType } from "#reducers/OrderReducer"
import type { Order } from "@commercelayer/sdk"
import { manageGiftCard } from "#utils/adyen/manageGiftCard"

interface ChildrenProps extends Omit<Props, "children" | "onClick"> {
  codeType?: OrderCodeType
  hide?: boolean
  handleClick?: () => void
}

type Props = {
  type?: CodeType
  children?: ChildrenFunction<ChildrenProps>
  label?: string | ReactNode
  onClick?: (response: { success: boolean; order?: Order }) => void
} & Omit<JSX.IntrinsicElements["button"], "type" | "onClick">

export function GiftCardOrCouponRemoveButton(props: Props): JSX.Element | null {
  const { children, label = "Remove", onClick, type, ...p } = props
  const {
    order,
    removeGiftCardOrCouponCode,
    manageAdyenGiftCard,
    paymentSourceRequest,
  } = useContext(OrderContext)
  let codeType = type ? (`${type}_code` as const) : undefined
  if (!type && order && "coupon_code" in order && order.coupon_code !== "")
    codeType = "coupon_code"
  else if (!type) codeType = "gift_card_code"
  const code = order && codeType ? order[codeType] : ""
  let hide = !(order && code)
  const handleClick = async (): Promise<void> => {
    if (manageAdyenGiftCard && codeType === "gift_card_code" && order != null) {
      const id = order?.payment_source?.id
      if (id != null) {
        const res = await paymentSourceRequest({
          resource: "adyen_payments",
          requestType: "update",
          attributes: {
            id,
            payment_request_data: {},
          },
          order,
        })
        if (onClick != null && res != null) onClick(res)
      }
    } else if (codeType != null && removeGiftCardOrCouponCode != null) {
      const response = await removeGiftCardOrCouponCode({ codeType })
      if (onClick != null && response != null) onClick(response)
    }
  }
  if (manageAdyenGiftCard && type === "gift_card") {
    const giftCardData = manageGiftCard({ order })
    if (!giftCardData) return null
    hide = false
    const parentProps = {
      ...p,
      label,
      handleClick,
      codeType,
    }
    return children ? (
      <Parent {...parentProps}>{children}</Parent>
    ) : hide ? null : (
      <button
        type="button"
        onClick={() => {
          handleClick()
        }}
        {...p}
      >
        {label}
      </button>
    )
  }
  const parentProps = {
    ...p,
    label,
    handleClick,
    codeType,
  }
  return children ? (
    <Parent {...parentProps}>{children}</Parent>
  ) : hide ? null : (
    <button
      type="button"
      onClick={() => {
        handleClick()
      }}
      {...p}
    >
      {label}
    </button>
  )
}

export default GiftCardOrCouponRemoveButton
