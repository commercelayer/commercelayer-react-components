import React, { FunctionComponent, ReactNode, useContext } from 'react'
import Parent from './utils/Parent'
import components from '#config/components'
import { FunctionChildren } from '#typings/index'
import OrderContext from '#context/OrderContext'
import { CodeType, OrderCodeType } from '#reducers/OrderReducer'

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
  type: CodeType
  children?: GiftCardOrCouponRemoveButtonChildrenProps
  label?: string | ReactNode
} & Omit<JSX.IntrinsicElements['button'], 'type'>

const GiftCardOrCouponRemoveButton: FunctionComponent<GiftCardOrCouponRemoveButtonProps> = (
  props
) => {
  const { children, label = 'Remove', onClick, type, ...p } = props
  const { order, removeGiftCardOrCouponCode } = useContext(OrderContext)
  const codeType = `${type}Code` as OrderCodeType
  const hide = order && order[codeType] ? false : true
  const handleClick = () => {
    removeGiftCardOrCouponCode && removeGiftCardOrCouponCode({ codeType })
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
