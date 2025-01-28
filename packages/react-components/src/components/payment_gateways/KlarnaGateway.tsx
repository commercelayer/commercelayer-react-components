import React, { type JSX } from 'react';
import KlarnaPayment from '#components/payment_source/KlarnaPayment'
import type { GatewayBaseType } from '#components/payment_gateways/PaymentGateway'
import CustomerContext from '#context/CustomerContext'
import OrderContext from '#context/OrderContext'
import PaymentMethodChildrenContext from '#context/PaymentMethodChildrenContext'
import PaymentMethodContext from '#context/PaymentMethodContext'
import PaymentSourceContext from '#context/PaymentSourceContext'
import {
  getPaymentConfig,
  type PaymentResource
} from '#reducers/PaymentMethodReducer'
import isEmpty from 'lodash/isEmpty'
import PaymentCardsTemplate from '#components/utils/PaymentCardsTemplate'
import getCardDetails from '#utils/getCardDetails'

type Props = GatewayBaseType

export function KlarnaGateway(props: Props): JSX.Element | null {
  const {
    readonly,
    showCard,
    handleEditClick,
    children,
    templateCustomerCards,
    loading,
    loaderComponent,
    ...p
  } = props
  const { order } = React.useContext(OrderContext)
  const { payment } = React.useContext(PaymentMethodChildrenContext)
  const { payments, isGuest } = React.useContext(CustomerContext)
  const { currentPaymentMethodId, config, paymentSource } =
    React.useContext(PaymentMethodContext)
  const paymentResource: PaymentResource = 'klarna_payments'
  const locale = order?.language_code

  if (!readonly && payment?.id !== currentPaymentMethodId) return null
  // @ts-expect-error no type
  const clientToken = paymentSource?.client_token
  const klarnaConfig = config
    ? getPaymentConfig<'klarna_payments'>(paymentResource, config)
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
        <KlarnaPayment
          clientToken={clientToken}
          locale={locale}
          {...klarnaConfig}
        />
      </>
    )
  }

  return (
    <KlarnaPayment
      clientToken={clientToken}
      locale={locale}
      {...klarnaConfig}
    />
  )
}

export default KlarnaGateway
