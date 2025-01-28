import BraintreePayment from '#components/payment_source/BraintreePayment'
import type { GatewayBaseType } from '#components/payment_gateways/PaymentGateway'
import CustomerContext from '#context/CustomerContext'
import OrderContext from '#context/OrderContext'
import PaymentMethodChildrenContext from '#context/PaymentMethodChildrenContext'
import PaymentMethodContext from '#context/PaymentMethodContext'
import PaymentSourceContext from '#context/PaymentSourceContext'
import type { PaymentResource } from '#reducers/PaymentMethodReducer'
import getCardDetails from '#utils/getCardDetails'
import type { StripeElementLocale } from '@stripe/stripe-js'
import isEmpty from 'lodash/isEmpty'
import { useContext, type JSX } from 'react';
import PaymentCardsTemplate from '../utils/PaymentCardsTemplate'
import { getPaymentAttributes } from '#utils/getPaymentAttributes'

type Props = GatewayBaseType

export function BraintreeGateway(props: Props): JSX.Element | null {
  const {
    readonly,
    showCard,
    handleEditClick,
    children,
    templateCustomerCards,
    loading,
    loaderComponent,
    templateCustomerSaveToWallet,
    ...p
  } = props
  const { order } = useContext(OrderContext)
  const { payment } = useContext(PaymentMethodChildrenContext)
  const { payments, isGuest } = useContext(CustomerContext)
  const { currentPaymentMethodId, config, paymentSource } =
    useContext(PaymentMethodContext)
  const paymentResource: PaymentResource = 'braintree_payments'
  const locale = order?.language_code as StripeElementLocale

  if (!readonly && payment?.id !== currentPaymentMethodId) return null
  // @ts-expect-error no type
  const authorization = paymentSource?.client_token
  const braintreeConfig = getPaymentAttributes({
    resource: paymentResource,
    config: config ?? {},
    keys: ['braintree_payments']
  })
  const paymentConfig = braintreeConfig?.braintreePayment
  const customerPayments =
    !isEmpty(payments) && payments
      ? payments.filter((customerPayment) => {
          return customerPayment.payment_source?.type === 'braintree_payments'
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
        <BraintreePayment
          templateCustomerSaveToWallet={templateCustomerSaveToWallet}
          authorization={authorization}
          locale={locale}
          config={paymentConfig}
        />
      </>
    )
  }
  return (
    <BraintreePayment
      locale={locale}
      authorization={authorization}
      config={paymentConfig}
    />
  )
}

export default BraintreeGateway
