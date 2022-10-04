import React from 'react'
import KlarnaPayment from '#components/payment_source/KlarnaPayment'
import { GatewayBaseType } from '#components/payment_gateways/PaymentGateway'
import CustomerContext from '#context/CustomerContext'
import OrderContext from '#context/OrderContext'
import PaymentMethodChildrenContext from '#context/PaymentMethodChildrenContext'
import PaymentMethodContext from '#context/PaymentMethodContext'
import PaymentSourceContext from '#context/PaymentSourceContext'
import {
  getPaymentConfig,
  PaymentResource
} from '#reducers/PaymentMethodReducer'
import isEmpty from 'lodash/isEmpty'
import PaymentCardsTemplate from '#components-utils/PaymentCardsTemplate'

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
  // @ts-expect-error
  const clientToken = paymentSource?.client_token
  const klarnaConfig = config
    ? getPaymentConfig<'klarnaPayment'>(paymentResource, config)
    : {}
  const customerPayments =
    !isEmpty(payments) && payments
      ? payments.filter((customerPayment) => {
          return customerPayment.payment_source?.type === paymentResource
        })
      : []

  if (readonly || showCard) {
    // @ts-expect-error
    const card = paymentSource?.options?.card
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

  return clientToken && !loading ? (
    <KlarnaPayment
      clientToken={clientToken}
      locale={locale}
      {...klarnaConfig}
    />
  ) : (
    loaderComponent
  )
}

export default KlarnaGateway
