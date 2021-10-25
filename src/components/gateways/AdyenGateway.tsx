import { GatewayBaseType } from '#components/PaymentGateway'
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
import AdyenPayment from '../AdyenPayment'
import PaymentCardsTemplate from '../utils/PaymentCardsTemplate'

type AdyenGateway = GatewayBaseType

export default function AdyenGateway(props: AdyenGateway) {
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
  const { currentPaymentMethodId, config, paymentSource } =
    useContext(PaymentMethodContext)
  const paymentResource: PaymentResource = 'adyen_payments'
  const locale = order?.languageCode as StripeElementLocale

  if (!readonly && payment?.id !== currentPaymentMethodId) return null

  const clientKey =
    // @ts-ignore
    paymentSource?.publicKey
  // TODO: Check
  const environment = paymentSource?.mode()
  const adyenConfig = config
    ? getPaymentConfig<'stripePayment'>(paymentResource, config)
    : {}
  const customerPayments =
    !isEmpty(payments) && payments
      ? payments.filter((customerPayment) => {
          return customerPayment.paymentSourceType === 'AdyenPayment'
        })
      : []

  if (readonly || showCard) {
    // @ts-ignore
    const card = paymentSource?.paymentRequestData?.paymentMethod as Record<
      string,
      any
    >
    const value = { ...card, showCard, handleEditClick, readonly }
    return isEmpty(card) ? null : (
      <PaymentSourceContext.Provider value={value}>
        {children}
      </PaymentSourceContext.Provider>
    )
  }

  if (!isGuest && templateCustomerCards) {
    // @ts-ignore
    return clientKey && !loading && paymentSource?.paymentMethods ? (
      <Fragment>
        {isEmpty(customerPayments) ? null : (
          <div className={p.className}>
            <PaymentCardsTemplate {...{ paymentResource, customerPayments }}>
              {templateCustomerCards}
            </PaymentCardsTemplate>
          </div>
        )}
        <AdyenPayment
          templateCustomerSaveToWallet={templateCustomerSaveToWallet}
          clientKey={clientKey}
          locale={locale}
          environment={environment}
          {...adyenConfig}
        />
      </Fragment>
    ) : (
      loaderComponent
    )
  }
  // @ts-ignore
  return clientKey && !loading && paymentSource?.paymentMethods ? (
    <AdyenPayment clientKey={clientKey} locale={locale} {...adyenConfig} />
  ) : (
    loaderComponent
  )
}
