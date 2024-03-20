import { type ReactNode, useContext } from 'react'
import Parent from '#components/utils/Parent'
import { type ChildrenFunction } from '#typings/index'
import OrderContext from '#context/OrderContext'
import { type CodeType, type OrderCodeType } from '#reducers/OrderReducer'
import type { Order } from '@commercelayer/sdk'

interface ChildrenProps extends Omit<Props, 'children' | 'onClick'> {
  codeType?: OrderCodeType
  hide?: boolean
  handleClick?: () => void
}

type Props = {
  type?: CodeType
  children?: ChildrenFunction<ChildrenProps>
  label?: string | ReactNode
  onClick?: (response: { success: boolean; order?: Order }) => void
} & Omit<JSX.IntrinsicElements['button'], 'type' | 'onClick'>

export function GiftCardOrCouponRemoveButton(props: Props): JSX.Element | null {
  const { children, label = 'Remove', onClick, type, ...p } = props
  const { order, removeGiftCardOrCouponCode } = useContext(OrderContext)
  let codeType = type ? (`${type}_code` as const) : undefined
  if (!type && order && 'coupon_code' in order && order.coupon_code !== '')
    codeType = 'coupon_code'
  else if (!type) codeType = 'gift_card_code'
  const code = order && codeType ? order[codeType] : ''
  const hide = !(order && code)
  const handleClick = async (): Promise<void> => {
    if (codeType != null && removeGiftCardOrCouponCode != null) {
      const response = await removeGiftCardOrCouponCode({ codeType })
      if (onClick != null && response != null) onClick(response)
    }
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
