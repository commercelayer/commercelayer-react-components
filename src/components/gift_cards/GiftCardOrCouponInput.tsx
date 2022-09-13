import { useContext } from 'react'

import BaseInput from '#components-utils/BaseInput'
import CouponAndGiftCardFormContext from '#context/CouponAndGiftCardFormContext'
import { BaseInputComponentProps } from '#typings'
import { OrderCodeType } from '#reducers/OrderReducer'

type Props = {
  name?: 'gift_card_or_coupon_code'
  type?: 'text'
  placeholderTranslation?: (codeType: OrderCodeType) => string
} & Omit<BaseInputComponentProps, 'name' | 'type'> &
  JSX.IntrinsicElements['input'] &
  JSX.IntrinsicElements['textarea']

export function GiftCardOrCouponInput(props: Props) {
  const {
    placeholder = '',
    required,
    value,
    placeholderTranslation,
    ...p
  } = props
  const { validation, codeType } = useContext(CouponAndGiftCardFormContext)
  let placeholderLabel = placeholder
  if (placeholderTranslation && codeType) {
    placeholderLabel = placeholderTranslation(codeType)
  }
  return (
    <BaseInput
      type="text"
      name="gift_card_or_coupon_code"
      ref={validation as any}
      required={required !== undefined ? required : true}
      placeholder={placeholderLabel}
      defaultValue={value}
      {...p}
    />
  )
}

export default GiftCardOrCouponInput
