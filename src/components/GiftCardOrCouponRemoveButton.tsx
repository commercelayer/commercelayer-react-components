import { FunctionComponent, ReactNode, useContext } from 'react'
import Parent from './utils/Parent'
import components from '#config/components'
import { FunctionChildren } from '#typings/index'
import OrderContext from '#context/OrderContext'
import { CodeType, OrderCodeType } from '#reducers/OrderReducer'
import { has, isEmpty } from 'lodash'

const propTypes = components.GiftCardOrCouponRemoveButton.propTypes
const displayName = components.GiftCardOrCouponRemoveButton.displayName

type GiftCardOrCouponRemoveButtonChildrenProps = FunctionChildren<
  Omit<GiftCardOrCouponRemoveButtonProps, 'children'> & {
    codeType?: OrderCodeType
    hide?: boolean
    handleClick?: () => void
  }
>

type GiftCardOrCouponRemoveButtonProps = {
  type?: CodeType
  children?: GiftCardOrCouponRemoveButtonChildrenProps
  label?: string | ReactNode
  onClick?: (response: { success: boolean }) => void
} & Omit<JSX.IntrinsicElements['button'], 'type'>

const GiftCardOrCouponRemoveButton: FunctionComponent<
  GiftCardOrCouponRemoveButtonProps
> = (props) => {
  const { children, label = 'Remove', onClick, type, ...p } = props
  const { order, removeGiftCardOrCouponCode } = useContext(OrderContext)
  let codeType = `${type}_code` as OrderCodeType
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
  const handleClick = async () => {
    const response =
      removeGiftCardOrCouponCode &&
      (await removeGiftCardOrCouponCode({ codeType }))
    onClick && onClick(response)
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
    <button type="button" onClick={handleClick} {...p}>
      {label}
    </button>
  )
}

GiftCardOrCouponRemoveButton.propTypes = propTypes
GiftCardOrCouponRemoveButton.displayName = displayName

export default GiftCardOrCouponRemoveButton
