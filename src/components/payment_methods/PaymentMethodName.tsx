import { useContext } from 'react'
import PaymentMethodChildrenContext from '#context/PaymentMethodChildrenContext'
import Parent from '#components-utils/Parent'

type PaymentMethodNameChildrenProps = Omit<Props, 'children'> & {
  labelName: string
}

type Props = {
  children?: (props: PaymentMethodNameChildrenProps) => JSX.Element
} & JSX.IntrinsicElements['label']

export function PaymentMethodName(props: Props) {
  const { payment } = useContext(PaymentMethodChildrenContext)
  const labelName = payment?.['name']
  const htmlFor = payment?.payment_source_type
  const parentProps = {
    htmlFor,
    labelName,
    ...props,
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
