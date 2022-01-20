import { GatewayBaseType } from '#components/PaymentGateway'
import StripePayment from '#components/StripePayment'
import CustomerContext from '#context/CustomerContext'
import OrderContext from '#context/OrderContext'
import PaymentMethodChildrenContext from '#context/PaymentMethodChildrenContext'
import PaymentMethodContext from '#context/PaymentMethodContext'
import PaymentSourceContext from '#context/PaymentSourceContext'
import {
  getPaymentConfig,
  PaymentResource,
} from '#reducers/PaymentMethodReducer'
import getCardDetails from '#utils/getCardDetails'
import { StripeElementLocale } from '@stripe/stripe-js'
import isEmpty from 'lodash/isEmpty'
import React from 'react'
import PaymentCardsTemplate from '../utils/PaymentCardsTemplate'

type StripeGateway = GatewayBaseType

export default function StripeGateway(props: StripeGateway) {
  const {
    readonly,
    showCard,
    handleEditClick,
    children,
    templateCustomerCards,
    show,
    loading,
    loaderComponent,
    templateCustomerSaveToWallet,
    ...p
  } = props
  const { order } = React.useContext(OrderContext)
  const { payment } = React.useContext(PaymentMethodChildrenContext)
  const { payments, isGuest } = React.useContext(CustomerContext)
  const { currentPaymentMethodId, config, paymentSource } =
    React.useContext(PaymentMethodContext)
  const paymentResource: PaymentResource = 'stripe_payments'
  const locale = order?.language_code as StripeElementLocale

  if (!readonly && payment?.id !== currentPaymentMethodId) return null
  // @ts-ignore
  const publishableKey = paymentSource?.publishable_key
  const paymentSourceId = order?.payment_source?.id || paymentSource?.id
  const stripeConfig = config
    ? getPaymentConfig<'stripePayment'>(paymentResource, config)
    : {}
  const customerPayments =
    !isEmpty(payments) && payments
      ? payments.filter((customerPayment) => {
          return customerPayment.payment_source?.type === paymentResource
        })
      : []

  if (readonly || showCard) {
    const card = getCardDetails({
      customerPayment: {
        payment_source: paymentSource,
      },
      paymentType: paymentResource,
    })
    const value = { ...card, showCard, handleEditClick, readonly }
    return isEmpty(card) ? null : (
      <PaymentSourceContext.Provider value={value}>
        {children}
      </PaymentSourceContext.Provider>
    )
  }
  if (!isGuest && templateCustomerCards) {
    return (
      <>
        {isEmpty(customerPayments) ? null : (
          <div className={p.className}>
            <PaymentCardsTemplate {...{ paymentResource, customerPayments }}>
              {templateCustomerCards}
            </PaymentCardsTemplate>
          </div>
        )}
        <StripePayment
          show={show}
          templateCustomerSaveToWallet={templateCustomerSaveToWallet}
          publishableKey={publishableKey}
          locale={locale}
          {...stripeConfig}
        />
      </>
    )
  }

  return publishableKey && !loading && paymentSourceId ? (
    <StripePayment
      show={show}
      publishableKey={publishableKey}
      locale={locale}
      {...stripeConfig}
    />
  ) : (
    loaderComponent
  )
}
