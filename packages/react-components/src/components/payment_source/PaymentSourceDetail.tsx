import PaymentSourceContext from '#context/PaymentSourceContext'
import { useContext, type JSX } from 'react';
import Parent from '#components/utils/Parent'
import type { ChildrenFunction } from '#typings'
import CustomerPaymentSourceContext from '#context/CustomerPaymentSourceContext'

export type PaymentSourceDetailType = 'last4' | 'exp_year' | 'exp_month'

interface ChildrenProps extends Omit<Props, 'children'> {
  text: string
}

interface Props extends Omit<JSX.IntrinsicElements['span'], 'children'> {
  children?: ChildrenFunction<ChildrenProps>
  /**
   * Type of detail to display
   */
  type: PaymentSourceDetailType
}
export function PaymentSourceDetail({
  type,
  children,
  ...p
}: Props): JSX.Element {
  const card = useContext(PaymentSourceContext)
  const customerCard = useContext(CustomerPaymentSourceContext)
  const cardObj = Object.keys(card).length > 0 ? card : customerCard
  const text =
    type in cardObj && cardObj[type] != null
      ? cardObj[type]
      : type === 'last4'
        ? '****'
        : '**'
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
