import components from '#config/components'
import PaymentSourceContext from '#context/PaymentSourceContext'
import { has } from 'lodash'
import { FunctionComponent, useContext } from 'react'
import Parent from './utils/Parent'
import { FunctionChildren } from '#typings'
const propTypes = components.PaymentSourceDetail.propTypes
const displayName = components.PaymentSourceDetail.displayName

export type PaymentSourceDetailType = 'last4' | 'exp_year' | 'exp_month'

type CustomComponent = FunctionChildren<
  Omit<Props & { text: string }, 'children'>
>

type Props = {
  children?: CustomComponent
  type: PaymentSourceDetailType
} & JSX.IntrinsicElements['span']
const PaymentSourceDetail: FunctionComponent<Props> = ({
  type,
  children,
  ...p
}) => {
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

PaymentSourceDetail.propTypes = propTypes
PaymentSourceDetail.displayName = displayName

export default PaymentSourceDetail
