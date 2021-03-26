import React, { FunctionComponent, useContext } from 'react'
import components from '#config/components'
import { FunctionChildren } from '#typings'
import Parent from './utils/Parent'
import OrderContext from '#context/OrderContext'
import { CodeType, OrderCodeType } from '#reducers/OrderReducer'

const propTypes = components.GiftCardOrCouponCode.propTypes
const displayName = components.GiftCardOrCouponCode.displayName

type GiftCardOrCouponCodeChildrenProps = FunctionChildren<
  Omit<GiftCardOrCouponCodeProps, 'children'> & {
    code?: string
    hide?: boolean
  }
>

type GiftCardOrCouponCodeProps = {
  type: CodeType
  children?: GiftCardOrCouponCodeChildrenProps
} & JSX.IntrinsicElements['span']

const GiftCardOrCouponCode: FunctionComponent<GiftCardOrCouponCodeProps> = ({
  children,
  type,
  ...props
}) => {
  const { order } = useContext(OrderContext)
  const codeType = `${type}Code` as OrderCodeType
  const code = order ? order[codeType] : ''
  const hide = order && order[codeType] ? false : true
  const parentProps = {
    ...props,
    code,
    hide,
  }
  return children ? (
    <Parent {...parentProps}>{children}</Parent>
  ) : hide ? null : (
    <span {...props}>{code}</span>
  )
}

GiftCardOrCouponCode.propTypes = propTypes
GiftCardOrCouponCode.displayName = displayName

export default GiftCardOrCouponCode
