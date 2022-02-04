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
import React, { Fragment, useContext } from 'react'
import PaymentCardsTemplate from '../utils/PaymentCardsTemplate'

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
    // onClickCustomerCards,
    loaderComponent,
    templateCustomerSaveToWallet,
    ...p
  } = props
  const { order } = useContext(OrderContext)
  const { payment } = useContext(PaymentMethodChildrenContext)
  const { payments, isGuest } = useContext(CustomerContext)
  const { currentPaymentMethodId, config, paymentSource } =
    useContext(PaymentMethodContext)
  const paymentResource: PaymentResource = 'stripe_payments'
  const locale = order?.language_code as StripeElementLocale

  if (!readonly && payment?.id !== currentPaymentMethodId) return null

  // @ts-ignore
  const publicKey = paymentSource?.public_key
  const paymentConfig = config
    ? getPaymentConfig<'stripePayment'>(paymentResource, config)
    : {}
  const customerPayments =
    !isEmpty(payments) && payments
      ? payments.filter((customerPayment) => {
          return customerPayment.payment_source?.type === 'stripe_payments'
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
    return (
      <Fragment>
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
      </Fragment>
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
