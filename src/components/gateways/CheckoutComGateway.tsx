import CheckoutComPayment from '#components/CheckoutComPayment'
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
import React from 'react'
import PaymentCardsTemplate from '../utils/PaymentCardsTemplate'
import getCardDetails from '../../utils/getCardDetails'

type CheckoutComGateway = GatewayBaseType

export default function CheckoutComGateway(props: CheckoutComGateway) {
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
  const paymentResource: PaymentResource = 'checkout_com_payments'
  const locale = order?.language_code as StripeElementLocale

  if (!readonly && payment?.id !== currentPaymentMethodId) return null
  // @ts-ignore
  const publicKey = paymentSource?.public_key
  const paymentConfig = config
    ? getPaymentConfig<'checkoutComPayment'>(paymentResource, config)
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
    return !card.brand ? null : (
      <PaymentSourceContext.Provider value={value}>
        {children}
      </PaymentSourceContext.Provider>
    )
  }
  if (!isGuest && templateCustomerCards) {
    return publicKey && !loading ? (
      <>
        {isEmpty(customerPayments) ? null : (
          <div className={p.className}>
            <PaymentCardsTemplate {...{ paymentResource, customerPayments }}>
              {templateCustomerCards}
            </PaymentCardsTemplate>
          </div>
        )}
        <CheckoutComPayment
          show={show}
          templateCustomerSaveToWallet={templateCustomerSaveToWallet}
          publicKey={publicKey}
          locale={locale}
          {...paymentConfig}
        />
      </>
    ) : (
      loaderComponent
    )
  }

  return publicKey && !loading ? (
    <CheckoutComPayment
      show={show}
      publicKey={publicKey}
      locale={locale}
      {...paymentConfig}
    />
  ) : (
    loaderComponent
  )
}
