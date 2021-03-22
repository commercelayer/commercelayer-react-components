import React, {
  useContext,
  FunctionComponent,
  ReactNode,
  useState,
  useEffect,
} from 'react'
import PaymentMethodChildrenContext from '#context/PaymentMethodChildrenContext'
import components from '#config/components'
import PaymentMethodContext from '#context/PaymentMethodContext'
import {
  getPaymentConfig,
  PaymentResource,
} from '#reducers/PaymentMethodReducer'
import StripePayment from './StripePayment'
import PaymentSourceContext from '#context/PaymentSourceContext'
import { isEmpty } from 'lodash'

const propTypes = components.PaymentSource.propTypes
const displayName = components.PaymentSource.displayName

type PaymentMethodNameProps = {
  children?: ReactNode
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
  const [showCard, setShowCard] = useState(false)
  useEffect(() => {
    if (payment?.id === currentPaymentMethodId) setShow(true)
    else setShow(false)
    if (!isEmpty(paymentSource)) setShowCard(true)
    return () => {
      setShow(false)
      setShowCard(false)
    }
  }, [currentPaymentMethodId, paymentSource])
  const handleEditClick = () => setShowCard(!showCard)
  const PaymentGateway = () => {
    const paymentResource = readonly
      ? currentPaymentMethodType
      : (payment?.paymentSourceType as PaymentResource)
    switch (paymentResource) {
      case 'stripe_payments':
        if (readonly || showCard) {
          // @ts-ignore
          const card = paymentSource?.options?.card as Record<string, any>
          const value = { ...card, showCard, handleEditClick, readonly }
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
  return <PaymentGateway />
}

PaymentSource.propTypes = propTypes
PaymentSource.displayName = displayName

export default PaymentSource
