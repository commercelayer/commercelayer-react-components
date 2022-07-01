import { useContext, ReactNode } from 'react'
import PaymentMethodChildrenContext from '#context/PaymentMethodChildrenContext'
import Parent from './utils/Parent'
import components from '#config/components'

const propTypes = components.PaymentMethodName.propTypes
const displayName = components.PaymentMethodName.displayName

type PaymentMethodNameChildrenProps = Omit<Props, 'children'> & {
  labelName: string
}

type Props = {
  children?: (props: PaymentMethodNameChildrenProps) => ReactNode
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

PaymentMethodName.propTypes = propTypes
PaymentMethodName.displayName = displayName

export default PaymentMethodName
