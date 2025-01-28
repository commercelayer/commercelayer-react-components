import type { GatewayBaseType } from '#components/payment_gateways/PaymentGateway'
import StripePayment from '#components/payment_source/StripePayment'
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
import type { StripeElementLocale } from '@stripe/stripe-js'
import isEmpty from 'lodash/isEmpty'
import { useContext, type JSX } from 'react';
import PaymentCardsTemplate from '../utils/PaymentCardsTemplate'

type Props = GatewayBaseType

export function StripeGateway(props: Props): JSX.Element | null {
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
  const { order } = useContext(OrderContext)
  const { payment, expressPayments } = useContext(PaymentMethodChildrenContext)
  const { payments, isGuest } = useContext(CustomerContext)
  const { currentPaymentMethodId, config, paymentSource } =
    useContext(PaymentMethodContext)
  const paymentResource: PaymentResource = 'stripe_payments'
  const locale = order?.language_code as StripeElementLocale

  if (!readonly && payment?.id !== currentPaymentMethodId) return null
  // @ts-expect-error no type
  const publishableKey = paymentSource?.publishable_key
  // @ts-expect-error no type
  const clientSecret = paymentSource?.client_secret
  const stripeConfig = config
    ? getPaymentConfig<'stripe_payments'>(paymentResource, config).stripePayment
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
    if (card?.brand === '') {
      card.brand =
        // @ts-expect-error missing type
        paymentSource?.payment_instrument?.issuer_type ?? 'credit-card'
    }
    const value = {
      ...card,
      showCard,
      handleEditClick,
      readonly,
      paymentSource
    }
    return card?.brand == null ? null : (
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
          clientSecret={clientSecret}
          expressPayments={expressPayments}
          locale={locale}
          {...stripeConfig}
        />
      </>
    )
  }
  return (
    <StripePayment
      show={show}
      publishableKey={publishableKey}
      clientSecret={clientSecret}
      locale={locale}
      expressPayments={expressPayments}
      {...stripeConfig}
    />
  )
}

export default StripeGateway
