import CustomerContext from '#context/CustomerContext'
import OrderContext from '#context/OrderContext'
import PaymentMethodChildrenContext from '#context/PaymentMethodChildrenContext'
import PaymentMethodContext from '#context/PaymentMethodContext'
import PaymentSourceContext from '#context/PaymentSourceContext'
import {
  getPaymentConfig,
  PaymentResource,
} from '#reducers/PaymentMethodReducer'
import isEmpty from 'lodash/isEmpty'
import React, {
  Fragment,
  FunctionComponent,
  useContext,
  useEffect,
} from 'react'
// import BraintreePayment from './BraintreePayment'
import { PaymentSourceProps } from './PaymentSource'
import StripePayment from './StripePayment'
import Parent from './utils/Parent'

type PaymentGatewayProps = PaymentSourceProps & {
  showCard: boolean
  handleEditClick: () => void
  show: boolean
}

const PaymentGateway: FunctionComponent<PaymentGatewayProps> = ({
  readonly,
  showCard,
  handleEditClick,
  children,
  templateCustomerCards,
  templateCustomerSaveToWallet,
  show,
  ...p
}) => {
  const { payment } = useContext(PaymentMethodChildrenContext)
  const { payments, isGuest } = useContext(CustomerContext)
  const { order } = useContext(OrderContext)
  const {
    currentPaymentMethodId,
    config,
    paymentSource,
    currentPaymentMethodType,
    setPaymentSource,
  } = useContext(PaymentMethodContext)
  const paymentResource = readonly
    ? currentPaymentMethodType
    : (payment?.paymentSourceType as PaymentResource)
  useEffect(() => {
    if (
      paymentResource &&
      !paymentSource &&
      payment?.id === currentPaymentMethodId &&
      order
    ) {
      setPaymentSource({
        paymentResource,
        order,
      })
    }
    return () => {}
  }, [paymentSource, order])
  console.log(`paymentSource`, paymentSource)
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
                paymentResource,
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
    case 'braintree_payments':
      if (payment?.id !== currentPaymentMethodId) return null
      // @ts-ignore
      const authorization = paymentSource?.clientToken
      console.log(`authorization`, authorization)
      return null
    // return <BraintreePayment authorization={authorization} />
    default:
      return null
  }
}

export default PaymentGateway
