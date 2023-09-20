import { type GatewayBaseType } from '#components/payment_gateways/PaymentGateway'
import ExternalPayment from '#components/payment_source/ExternalPayment'
import CustomerContext from '#context/CustomerContext'
import OrderContext from '#context/OrderContext'
import PaymentMethodChildrenContext from '#context/PaymentMethodChildrenContext'
import PaymentMethodContext from '#context/PaymentMethodContext'
import PaymentSourceContext from '#context/PaymentSourceContext'
import {
  getPaymentConfig,
  type PaymentResource
} from '#reducers/PaymentMethodReducer'
import getCardDetails from '#utils/getCardDetails'
import { type StripeElementLocale } from '@stripe/stripe-js'
import isEmpty from 'lodash/isEmpty'
import React from 'react'
import PaymentCardsTemplate from '../utils/PaymentCardsTemplate'

type Props = GatewayBaseType

export function ExternalGateway(props: Props): JSX.Element | null {
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
  const paymentResource: PaymentResource = 'external_payments'
  const locale = order?.language_code as StripeElementLocale

  if (!readonly && payment?.id !== currentPaymentMethodId) return null
  // @ts-expect-error no type
  const paymentSourceToken = paymentSource?.payment_source_token
  const paymentSourceId = order?.payment_source?.id || paymentSource?.id
  const getConfig = config
    ? getPaymentConfig<'external_payments'>(paymentResource, config)
    : {}
  const paymentConfig = getConfig?.externalPayment
  const customerPayments =
    !isEmpty(payments) && payments
      ? payments.filter((customerPayment) => {
          return customerPayment.payment_source?.type === paymentResource
        })
      : []

  if (readonly || showCard) {
    const card = getCardDetails({
      customerPayment: {
        // @ts-expect-error missing type
        payment_source: paymentSource
      },
      paymentType: paymentResource
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
        <ExternalPayment
          show={show}
          templateCustomerSaveToWallet={templateCustomerSaveToWallet}
          paymentSourceToken={paymentSourceToken}
          locale={locale}
          {...paymentConfig}
        />
      </>
    )
  }
  return paymentSourceToken && !loading && paymentSourceId ? (
    <ExternalPayment
      show={show}
      paymentSourceToken={paymentSourceToken}
      locale={locale}
      {...paymentConfig}
    />
  ) : (
    loaderComponent
  )
}

export default ExternalGateway
