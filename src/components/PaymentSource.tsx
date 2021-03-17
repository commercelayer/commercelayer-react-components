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
import PaymentSourceContext from '#context/PaymentSourceContext'

const propTypes = components.PaymentSource.propTypes
const displayName = components.PaymentSource.displayName

type PaymentMethodNameChildrenProps = Omit<PaymentMethodNameProps, 'children'>

type CustomComponent = (props: PaymentMethodNameChildrenProps) => ReactNode

type PaymentMethodNameProps = {
  children?: CustomComponent | ReactNode
  readonly?: boolean
} & JSX.IntrinsicElements['div']

const PaymentSource: FunctionComponent<PaymentMethodNameProps> = (props) => {
  const { children, readonly = false, ...p } = props
  const { payment } = useContext(PaymentMethodChildrenContext)
  const {
    currentPaymentMethodId,
    config,
    paymentSource,
    currentPaymentMethodType,
  } = useContext(PaymentMethodContext)
  const [show, setShow] = useState(false)
  const parentProps = {
    currentPaymentMethodId,
    payment,
    config,
    readonly,
    ...props,
  }
  useEffect(() => {
    if (payment?.id === currentPaymentMethodId) setShow(true)
    else setShow(false)
    return () => setShow(false)
  }, [currentPaymentMethodId])
  const PaymentGateway = () => {
    const paymentResource = readonly
      ? currentPaymentMethodType
      : (payment?.paymentSourceType as PaymentResource)
    switch (paymentResource) {
      case 'stripe_payments':
        if (readonly) {
          // @ts-ignore
          const card = paymentSource?.options?.card as Record<string, any>
          const value = { ...card }
          return (
            <PaymentSourceContext.Provider value={value}>
              {children}
            </PaymentSourceContext.Provider>
          )
        }
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
  return children && !readonly ? (
    <Parent {...parentProps}>{children as CustomComponent}</Parent>
  ) : (
    <PaymentGateway />
  )
}

PaymentSource.propTypes = propTypes
PaymentSource.displayName = displayName

export default PaymentSource
