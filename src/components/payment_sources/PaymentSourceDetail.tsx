import PaymentSourceContext from '#context/PaymentSourceContext'
import { has } from 'lodash'
import { useContext } from 'react'
import Parent from '#components-utils/Parent'
import { FunctionChildren } from '#typings'

export type PaymentSourceDetailType = 'last4' | 'exp_year' | 'exp_month'

type CustomComponent = FunctionChildren<
  Omit<Props & { text: string }, 'children'>
>

type Props = {
  children?: CustomComponent
  type: PaymentSourceDetailType
} & JSX.IntrinsicElements['span']
export function PaymentSourceDetail({ type, children, ...p }: Props) {
  const card = useContext(PaymentSourceContext)
  const text = has(card, type) ? card[type] : type === 'last4' ? '****' : '**'
  const parentProps = {
    type,
    text,
    ...p,
  }
  return children ? (
    <Parent {...parentProps}>{children}</Parent>
  ) : (
    <span {...p}>{text}</span>
  )
}

export default PaymentSourceDetail
