import { ReactNode } from 'react'
import Parent from './utils/Parent'
import components from '#config/components'
import { FunctionChildren } from '#typings/index'

const propTypes = components.GiftCardOrCouponSubmit.propTypes
const displayName = components.GiftCardOrCouponSubmit.displayName

type GiftCardOrCouponSubmitChildrenProps = FunctionChildren<
  Omit<Props, 'children'>
>

type Props = {
  children?: GiftCardOrCouponSubmitChildrenProps
  label?: string | ReactNode
} & JSX.IntrinsicElements['button']

export function GiftCardOrCouponSubmit(props: Props) {
  const { children, label = 'Submit', ...p } = props
  const parentProps = {
    ...p,
    label,
  }
  return children ? (
    <Parent {...parentProps}>{children}</Parent>
  ) : (
    <button type="submit" {...p}>
      {label}
    </button>
  )
}

GiftCardOrCouponSubmit.propTypes = propTypes
GiftCardOrCouponSubmit.displayName = displayName

export default GiftCardOrCouponSubmit
