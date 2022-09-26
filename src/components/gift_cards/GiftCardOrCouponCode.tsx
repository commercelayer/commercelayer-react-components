import { useContext } from 'react'
import { ChildrenFunction } from '#typings'
import Parent from '#components-utils/Parent'
import OrderContext from '#context/OrderContext'
import type { CodeType } from '#reducers/OrderReducer'
import has from 'lodash/has'
import isEmpty from 'lodash/isEmpty'

interface ChildrenProps extends Omit<Props, 'children'> {
  code?: string
  hide?: boolean
  discountAmountCents?: number
  discountAmountFloat?: number
  formattedDiscountAmount?: string
}

interface Props extends Omit<JSX.IntrinsicElements['span'], 'children'> {
  type?: CodeType
  children?: ChildrenFunction<ChildrenProps>
}

export function GiftCardOrCouponCode({
  children,
  type,
  ...props
}: Props): JSX.Element | null {
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
  const hide = !(order && code)
  const parentProps: ChildrenProps = {
    ...props,
    code,
    hide,
    discountAmountCents: order?.discount_amount_cents,
    discountAmountFloat: order?.discount_amount_float,
    formattedDiscountAmount: order?.formatted_discount_amount
  }
  return children ? (
    <Parent {...parentProps}>{children}</Parent>
  ) : hide ? null : (
    <span {...props}>{code}</span>
  )
}

export default GiftCardOrCouponCode
