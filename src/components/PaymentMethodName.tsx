import { useContext, FunctionComponent, ReactNode } from 'react'
import PaymentMethodChildrenContext from '#context/PaymentMethodChildrenContext'
import Parent from './utils/Parent'
import components from '#config/components'

const propTypes = components.PaymentMethodName.propTypes
const displayName = components.PaymentMethodName.displayName

type PaymentMethodNameChildrenProps = Omit<
  PaymentMethodNameProps,
  'children'
> & { 
  labelName: string 
  imagePath: string
}

type PaymentMethodNameProps = {
  children?: (props: PaymentMethodNameChildrenProps) => ReactNode
} & JSX.IntrinsicElements['label']

const PaymentMethodName: FunctionComponent<PaymentMethodNameProps> = (
  props
) => {
  const { payment } = useContext(PaymentMethodChildrenContext)
  let labelName = payment?.['name']
  let htmlFor = payment?.payment_source_type
  let imagePath = ''
  if (payment?.metadata && payment.metadata['image_path']) {
    imagePath = payment?.metadata['image_path']
  }

  if (payment?.reference) {
    htmlFor = payment.reference
    switch (payment?.reference) {
      case "AFTERPAY":
        labelName = "Afterpay"
        break
      case "APPLEPAY":
        labelName = "Apple Pay"
        break
      case "BANKTRANS":
        labelName = "Bank Transfer"
        break
      case "BELFIUS":
        labelName = "Belfius"
        break
      case "CBC":
        labelName = "CBC"
        break
      case "CREDITCARD":
        labelName = "Credit Card"
        break
      case "DIRECTBANK":
        labelName = "Wire Transfer"
        break
      case "DOTPAY":
        labelName = "Dotpay"
        break
      case "GOOGLEPAY":
        labelName = "Google Pay"
        break
      case "IDEAL":
        labelName = "iDEAL"
        break
      case "IDEALQR":
        labelName = "iDeal"
        break
      case "KBC":
        labelName = "KBC"
        break
      case "MISTERCASH":
        labelName = "Mister Cash"
        break
      case "TRUSTLY":
        labelName = "Trustly"
        break
      case "VVVGIFTCARD":
        labelName = "VVV Cadeaubon"
        break
    }
  }

  const parentProps = {
    htmlFor,
    labelName,
    imagePath,
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
