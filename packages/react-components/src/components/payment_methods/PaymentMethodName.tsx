import PaymentMethodChildrenContext from '#context/PaymentMethodChildrenContext'
import Parent from '#components/utils/Parent'
import useCustomContext from '#utils/hooks/useCustomContext'
import type { ChildrenFunction } from '#typings/index'

import type { JSX } from "react";

interface ChildrenProps extends Omit<Props, 'children'> {
  labelName: string
}

interface Props extends Omit<JSX.IntrinsicElements['label'], 'children'> {
  children?: ChildrenFunction<ChildrenProps>
}

export function PaymentMethodName(props: Props): JSX.Element {
  const { payment } = useCustomContext({
    context: PaymentMethodChildrenContext,
    contextComponentName: 'PaymentMethod',
    currentComponentName: 'PaymentMethodName',
    key: 'payment'
  })
  const labelName = payment?.name
  const htmlFor = payment?.payment_source_type
  const paymentGateway = payment?.payment_gateway
  const parentProps = {
    htmlFor,
    labelName,
    paymentGateway,
    ...props
  }
  return props.children ? (
    <Parent {...parentProps}>{props.children}</Parent>
  ) : (
    <label htmlFor={htmlFor} {...props}>
      {labelName}
    </label>
  )
}

export default PaymentMethodName
