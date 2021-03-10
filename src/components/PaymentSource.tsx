import React, {
  useContext,
  FunctionComponent,
  ReactNode,
  useState,
  useEffect,
} from 'react'
import PaymentMethodChildrenContext from '#context/PaymentMethodChildrenContext'
import Parent from './utils/Parent'
import components from '#config/components'
import PaymentMethodContext from '#context/PaymentMethodContext'
import {
  getPaymentConfig,
  PaymentResource,
} from '#reducers/PaymentMethodReducer'
import StripePayment from './StripePayment'

const propTypes = components.PaymentSource.propTypes
const displayName = components.PaymentSource.displayName

type PaymentMethodNameChildrenProps = Omit<PaymentMethodNameProps, 'children'>

type PaymentMethodNameProps = {
  children?: (props: PaymentMethodNameChildrenProps) => ReactNode
} & JSX.IntrinsicElements['div']

const PaymentSource: FunctionComponent<PaymentMethodNameProps> = (props) => {
  const { children, ...p } = props
  const { payment } = useContext(PaymentMethodChildrenContext)
  const { currentPaymentMethodId, config } = useContext(PaymentMethodContext)
  const [show, setShow] = useState(false)
  const parentProps = {
    currentPaymentMethodId,
    payment,
    config,
    ...props,
  }
  useEffect(() => {
    if (payment?.id === currentPaymentMethodId) setShow(true)
    else setShow(false)
    return () => setShow(false)
  }, [currentPaymentMethodId])
  const PaymentGateway = () => {
    const paymentResource = payment?.paymentSourceType as PaymentResource
    switch (paymentResource) {
      case 'stripe_payments':
        const stripeConfig = config
          ? getPaymentConfig(paymentResource, config)
          : null
        return stripeConfig ? (
          <StripePayment show={show} {...stripeConfig} {...p} />
        ) : null
      default:
        return null
    }
  }
  return children ? (
    <Parent {...parentProps}>{children}</Parent>
  ) : (
    <PaymentGateway />
  )
}

PaymentSource.propTypes = propTypes
PaymentSource.displayName = displayName

export default PaymentSource
