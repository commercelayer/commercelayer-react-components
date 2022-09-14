import { useContext } from 'react'
import components from '#config/components'
import { FunctionChildren } from '#typings'
import Parent from '#components-utils/Parent'
import OrderContext from '#context/OrderContext'
import type { CodeType } from '#reducers/OrderReducer'
import has from 'lodash/has'
import isEmpty from 'lodash/isEmpty'

const propTypes = components.GiftCardOrCouponCode.propTypes
const displayName = components.GiftCardOrCouponCode.displayName

type ChildrenProps = Omit<Props, 'children'> & {
  code?: string
  hide?: boolean
  discountAmountCents?: string
  discountAmountFloat?: string
  formattedDiscountAmount?: string
}

type GiftCardOrCouponCodeChildrenProps = FunctionChildren<ChildrenProps>

type Props = {
  type?: CodeType
  children?: GiftCardOrCouponCodeChildrenProps
} & JSX.IntrinsicElements['span']

export function GiftCardOrCouponCode({ children, type, ...props }: Props) {
  const { order } = useContext(OrderContext)
  let codeType = type && (`${type}_code` as const)
  if (
    !type &&
    order &&
    has(order, 'coupon_code') &&
    !isEmpty(order.coupon_code)
  )
    codeType = 'coupon_code'
  else if (!type) codeType = 'gift_card_code'
  const code = order && codeType ? order[codeType] : ''
  const hide = order && code ? false : true
  const parentProps = {
    ...props,
    code,
    hide,
    discountAmountCents: order?.discount_amount_cents,
    discountAmountFloat: order?.discount_amount_float,
    formattedDiscountAmount: order?.formatted_discount_amount,
  } as ChildrenProps
  return children ? (
    <Parent {...parentProps}>{children}</Parent>
  ) : hide ? null : (
    <span {...props}>{code}</span>
  )
}

GiftCardOrCouponCode.propTypes = propTypes
GiftCardOrCouponCode.displayName = displayName

export default GiftCardOrCouponCode
