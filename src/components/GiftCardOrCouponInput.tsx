import React, { FunctionComponent, useContext } from 'react'
import components from '#config/components'
import BaseInput from './utils/BaseInput'
import CouponAndGiftCardFormContext from '#context/CouponAndGiftCardFormContext'
import { BaseInputComponentProps } from '#typings'

const propTypes = components.GiftCardOrCouponInput.propTypes
const displayName = components.GiftCardOrCouponInput.displayName

export type GiftCardOrCouponInputProps = {
  name?: 'gift_card_or_coupon_code'
  type?: 'text'
} & Omit<BaseInputComponentProps, 'name' | 'type'> &
  JSX.IntrinsicElements['input'] &
  JSX.IntrinsicElements['textarea']

const GiftCardOrCouponInput: FunctionComponent<GiftCardOrCouponInputProps> = (
  props
) => {
  const { placeholder = '', required, value, ...p } = props
  const { validation } = useContext(CouponAndGiftCardFormContext)
  return (
    <BaseInput
      type="text"
      name="gift_card_or_coupon_code"
      ref={validation}
      required={required !== undefined ? required : true}
      placeholder={placeholder}
      defaultValue={value}
      {...p}
    />
  )
}

GiftCardOrCouponInput.propTypes = propTypes
GiftCardOrCouponInput.displayName = displayName

export default GiftCardOrCouponInput
