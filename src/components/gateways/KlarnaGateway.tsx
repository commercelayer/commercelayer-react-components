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
import isEmpty from 'lodash/isEmpty'
import React, { Fragment, useContext } from 'react'
import PaymentCardsTemplate from '../utils/PaymentCardsTemplate'

type KlarnaGateway = GatewayBaseType

export default function KlarnaGateway(props: KlarnaGateway) {
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
  const paymentResource: PaymentResource = 'klarna_payments'
  const locale = order?.language_code

  if (!readonly && payment?.id !== currentPaymentMethodId) return null

  // @ts-ignore
  const clientToken = paymentSource?.client_token
  const stripeConfig = config
    ? getPaymentConfig<'stripePayment'>(paymentResource, config)
    : {}
  const customerPayments =
    !isEmpty(payments) && payments
      ? payments.filter((customerPayment) => {
          return customerPayment.payment_source?.type === 'klarna_payments'
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
        <StripePayment
          show={show}
          templateCustomerSaveToWallet={templateCustomerSaveToWallet}
          clientToken={clientToken}
          locale={locale}
          {...stripeConfig}
        />
      </Fragment>
    )
  }

  return clientToken && !loading ? (
    <StripePayment
      show={show}
      clientToken={clientToken}
      locale={locale}
      {...stripeConfig}
    />
  ) : (
    loaderComponent
  )
}
