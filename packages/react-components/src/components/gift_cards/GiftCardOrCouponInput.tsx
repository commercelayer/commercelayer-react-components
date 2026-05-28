import { type JSX, useContext } from "react"
import BaseInput from "#components/utils/BaseInput"
import CouponAndGiftCardFormContext from "#context/CouponAndGiftCardFormContext"
import type { OrderCodeType } from "#reducers/OrderReducer"
import type { BaseInputComponentProps } from "#typings"

type FieldName = "gift_card_code" | "coupon_code"

type Props = {
  name?: FieldName
  type?: "text"
  placeholderTranslation?: (codeType: OrderCodeType) => string
} & Omit<BaseInputComponentProps, "name" | "type"> &
  Omit<JSX.IntrinsicElements["input"], "children"> &
  Omit<JSX.IntrinsicElements["textarea"], "children">

export function GiftCardOrCouponInput(props: Props): JSX.Element | null {
  const { placeholder = "", required, value, placeholderTranslation, name, ...p } = props
  const { validation, codeType } = useContext(CouponAndGiftCardFormContext)
  let placeholderLabel = placeholder
  if (placeholderTranslation && codeType) {
    placeholderLabel = placeholderTranslation(codeType)
  }
  return codeType == null ? null : (
    <BaseInput
      type="text"
      name={codeType ?? "gift_card_or_coupon_code"}
      // biome-ignore lint/suspicious/noExplicitAny: ref forwarding requires any cast for BaseInput compatibility
      ref={validation as any}
      required={required !== undefined ? required : true}
      placeholder={placeholderLabel}
      defaultValue={value}
      {...p}
    />
  )
}

export default GiftCardOrCouponInput
