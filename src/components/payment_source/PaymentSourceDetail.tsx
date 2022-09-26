import PaymentSourceContext from '#context/PaymentSourceContext'
import { has } from 'lodash'
import { useContext } from 'react'
import Parent from '#components-utils/Parent'
import { ChildrenFunction } from '#typings'

export type PaymentSourceDetailType = 'last4' | 'exp_year' | 'exp_month'

interface ChildrenProps extends Omit<Props, 'children'> {
  text: string
}

interface Props extends Omit<JSX.IntrinsicElements['span'], 'children'> {
  children?: ChildrenFunction<ChildrenProps>
  type: PaymentSourceDetailType
}
export function PaymentSourceDetail({
  type,
  children,
  ...p
}: Props): JSX.Element {
  const card = useContext(PaymentSourceContext)
  const text = has(card, type) ? card[type] : type === 'last4' ? '****' : '**'
  const parentProps = {
    type,
    text,
    ...p
  }
  return children ? (
    <Parent {...parentProps}>{children}</Parent>
  ) : (
    <span {...p}>{text}</span>
  )
}

export default PaymentSourceDetail
