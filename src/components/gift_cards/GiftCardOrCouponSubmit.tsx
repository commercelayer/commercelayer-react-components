import Parent from '#components-utils/Parent'
import { FunctionChildren } from '#typings/index'

type GiftCardOrCouponSubmitChildrenProps = FunctionChildren<
  Omit<Props, 'children'>
>

type Props = {
  children?: GiftCardOrCouponSubmitChildrenProps
  label?: string | JSX.Element
} & JSX.IntrinsicElements['button']

export function GiftCardOrCouponSubmit(props: Props): JSX.Element {
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

export default GiftCardOrCouponSubmit
