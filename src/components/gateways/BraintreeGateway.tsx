import BraintreePayment from '#components/BraintreePayment'
import { GatewayBaseType } from '#components/PaymentGateway'
import Parent from '#components/utils/Parent'
import CustomerContext from '#context/CustomerContext'
import OrderContext from '#context/OrderContext'
import PaymentMethodChildrenContext from '#context/PaymentMethodChildrenContext'
import PaymentMethodContext from '#context/PaymentMethodContext'
import PaymentSourceContext from '#context/PaymentSourceContext'
import {
  getPaymentConfig,
  PaymentResource,
} from '#reducers/PaymentMethodReducer'
import { StripeElementLocale } from '@stripe/stripe-js'
import isEmpty from 'lodash/isEmpty'
import React, { Fragment, useContext } from 'react'

type BraintreeGateway = GatewayBaseType

export default function BraintreeGateway(props: BraintreeGateway) {
  const {
    readonly,
    showCard,
    handleEditClick,
    children,
    templateCustomerCards,
    show,
    loading,
    onClickCustomerCards,
    loaderComponent,
    templateCustomerSaveToWallet,
    ...p
  } = props
  const { order } = useContext(OrderContext)
  const { payment } = useContext(PaymentMethodChildrenContext)
  const { payments, isGuest } = useContext(CustomerContext)
  const { currentPaymentMethodId, config, paymentSource, setPaymentSource } =
    useContext(PaymentMethodContext)
  const paymentResource: PaymentResource = 'braintree_payments'
  const locale = order?.languageCode as StripeElementLocale

  if (!readonly && payment?.id !== currentPaymentMethodId) return null
  // @ts-ignore
  const authorization = paymentSource?.clientToken
  const braintreeConfig = config
    ? getPaymentConfig<'braintreePayment'>(paymentResource, config)
    : {}
  const braintreeCustomerPayments =
    !isEmpty(payments) && payments
      ? payments.filter((customerPayment) => {
          return customerPayment.paymentSourceType === 'BraintreePayment'
        })
      : []
  if (readonly || showCard) {
    // @ts-ignore
    const card = paymentSource?.options?.card as Record<string, any>
    const value = { ...card, showCard, handleEditClick, readonly }
    return isEmpty(card) ? null : (
      <PaymentSourceContext.Provider value={value}>
        {children}
      </PaymentSourceContext.Provider>
    )
  }
  if (!isGuest && templateCustomerCards) {
    const customerPaymentsCards = braintreeCustomerPayments.map(
      (customerPayment, i) => {
        // @ts-ignore
        const card = customerPayment?.paymentSource()?.options?.card as Record<
          string,
          any
        >
        const handleClick = async () => {
          await setPaymentSource({
            paymentResource,
            customerPaymentSourceId: customerPayment.id,
          })
          onClickCustomerCards && onClickCustomerCards
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
    return authorization && !loading ? (
      <Fragment>
        {isEmpty(customerPaymentsCards) ? null : (
          <div className={p.className}>{customerPaymentsCards}</div>
        )}
        <BraintreePayment
          // show={show}
          templateCustomerSaveToWallet={templateCustomerSaveToWallet}
          authorization={authorization}
          locale={locale}
          config={braintreeConfig}
        />
      </Fragment>
    ) : (
      loaderComponent
    )
  }
  return authorization && !loading ? (
    <BraintreePayment authorization={authorization} />
  ) : (
    loaderComponent
  )
}
