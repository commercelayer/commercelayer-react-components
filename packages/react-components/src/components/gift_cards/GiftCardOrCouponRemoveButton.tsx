import { ReactNode, useContext } from 'react'
import Parent from '#components/utils/Parent'
import { ChildrenFunction } from '#typings/index'
import OrderContext from '#context/OrderContext'
import { CodeType, OrderCodeType } from '#reducers/OrderReducer'
import { has, isEmpty } from 'lodash'

interface ChildrenProps extends Omit<Props, 'children'> {
  codeType?: OrderCodeType
  hide?: boolean
  handleClick?: () => void
}

type Props = {
  type?: CodeType
  children?: ChildrenFunction<ChildrenProps>
  label?: string | ReactNode
  onClick?: (response: { success: boolean }) => void
} & Omit<JSX.IntrinsicElements['button'], 'type'>

export function GiftCardOrCouponRemoveButton(props: Props): JSX.Element | null {
  const { children, label = 'Remove', onClick, type, ...p } = props
  const { order, removeGiftCardOrCouponCode } = useContext(OrderContext)
  let codeType = type ? (`${type}_code` as const) : undefined
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
  const handleClick = async (): Promise<void> => {
    const response =
      removeGiftCardOrCouponCode &&
      codeType &&
      (await removeGiftCardOrCouponCode({ codeType }))
    if (onClick && response) onClick(response)
  }
  const parentProps = {
    ...p,
    label,
    handleClick,
    codeType
  }
  return children ? (
    <Parent {...parentProps}>{children}</Parent>
  ) : hide ? null : (
    <button
      type='button'
      onClick={() => {
        void handleClick()
      }}
      {...p}
    >
      {label}
    </button>
  )
}

export default GiftCardOrCouponRemoveButton
