import React, {
  useContext,
  FunctionComponent,
  ReactNode,
  useState,
  useEffect,
  Fragment,
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
import CustomerContext from '#context/CustomerContext'
import Parent from './utils/Parent'

const propTypes = components.PaymentSource.propTypes
const displayName = components.PaymentSource.displayName

type CustomerCardsProps = {
  handleClick: () => void
}

type CustomerSaveToWalletProps = {
  name: 'save_payment_source_to_customer_wallet'
}

export type PaymentMethodNameProps = {
  children?: ReactNode
  readonly?: boolean
  templateCustomerCards?: (props: CustomerCardsProps) => ReactNode
  templateCustomerSaveToWallet?: (props: CustomerSaveToWalletProps) => ReactNode
} & JSX.IntrinsicElements['div']

const PaymentSource: FunctionComponent<PaymentMethodNameProps> = (props) => {
  const {
    children,
    readonly = false,
    templateCustomerCards,
    templateCustomerSaveToWallet,
    ...p
  } = props
  const { payment } = useContext(PaymentMethodChildrenContext)
  const { payments, isGuest } = useContext(CustomerContext)
  const {
    currentPaymentMethodId,
    config,
    paymentSource,
    currentPaymentMethodType,
    setPaymentSource,
  } = useContext(PaymentMethodContext)
  const [show, setShow] = useState(false)
  const [showCard, setShowCard] = useState(false)

  useEffect(() => {
    if (payment?.id === currentPaymentMethodId) {
      setShow(true)
      if (!isEmpty(paymentSource)) setShowCard(true)
    } else setShow(false)
    return () => {
      setShow(false)
      setShowCard(false)
    }
  }, [currentPaymentMethodId, paymentSource, payments, payment])
  const handleEditClick = () => setShowCard(!showCard)
  const PaymentGateway = () => {
    const paymentResource = readonly
      ? currentPaymentMethodType
      : (payment?.paymentSourceType as PaymentResource)
    switch (paymentResource) {
      case 'stripe_payments':
        if (payment?.id !== currentPaymentMethodId) return null
        const stripeConfig = config
          ? getPaymentConfig(paymentResource, config)
          : null
        const customerPayments =
          !isEmpty(payments) && payments
            ? payments.filter((customerPayment) => {
                return customerPayment.paymentSourceType === 'StripePayment'
              })
            : []
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
        if (!isGuest && templateCustomerCards) {
          const customerPaymentsCards = customerPayments.map(
            (customerPayment, i) => {
              // @ts-ignore
              const card = customerPayment?.paymentSource()?.options
                ?.card as Record<string, any>
              const handleClick = async () => {
                await setPaymentSource({
                  paymentResource: 'StripePayment',
                  customerPaymentSourceId: customerPayment.id,
                })
              }
              const value = {
                ...card,
                showCard,
                handleEditClick,
                readonly,
                handleClick,
              }
              return (
                <PaymentSourceContext.Provider key={i} value={value}>
                  <Parent {...value}>{templateCustomerCards}</Parent>
                </PaymentSourceContext.Provider>
              )
            }
          )
          return stripeConfig ? (
            <Fragment>
              {isEmpty(customerPaymentsCards) ? null : (
                <div className={p.className}>{customerPaymentsCards}</div>
              )}
              <StripePayment
                show={show}
                {...stripeConfig}
                templateCustomerSaveToWallet={templateCustomerSaveToWallet}
              />
            </Fragment>
          ) : null
        }
        return stripeConfig ? (
          <StripePayment show={show} {...stripeConfig} />
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
