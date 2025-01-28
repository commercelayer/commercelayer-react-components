import type { GatewayBaseType } from '#components/payment_gateways/PaymentGateway'
import CommerceLayerContext from '#context/CommerceLayerContext'
import CustomerContext from '#context/CustomerContext'
import OrderContext from '#context/OrderContext'
import PaymentMethodChildrenContext from '#context/PaymentMethodChildrenContext'
import PaymentMethodContext from '#context/PaymentMethodContext'
import PaymentSourceContext from '#context/PaymentSourceContext'
import type { PaymentResource } from '#reducers/PaymentMethodReducer'
import type { StripeElementLocale } from '@stripe/stripe-js'
import isEmpty from 'lodash/isEmpty'
import { useContext, type JSX } from 'react'
import AdyenPayment from '#components/payment_source/AdyenPayment'
import PaymentCardsTemplate from '../utils/PaymentCardsTemplate'
import { jwt } from '#utils/jwt'
import getCardDetails from '#utils/getCardDetails'
import { getPaymentAttributes } from '#utils/getPaymentAttributes'

type Props = GatewayBaseType

export function AdyenGateway(props: Props): JSX.Element | null {
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
  const { accessToken } = useContext(CommerceLayerContext)
  const { payment } = useContext(PaymentMethodChildrenContext)
  const { payments, isGuest } = useContext(CustomerContext)
  const { currentPaymentMethodId, config, paymentSource } =
    useContext(PaymentMethodContext)
  const paymentResource: PaymentResource = 'adyen_payments'
  const locale = order?.language_code as StripeElementLocale
  if (!readonly && payment?.id !== currentPaymentMethodId) return null
  // @ts-expect-error no type
  const clientKey = paymentSource?.public_key
  const environment = accessToken && jwt(accessToken).test ? 'test' : 'live'
  const adyenConfig = getPaymentAttributes({
    resource: paymentResource,
    config: config ?? {},
    keys: ['adyen_payments']
  })
  const paymentConfig = adyenConfig?.adyenPayment
  const customerPayments =
    !isEmpty(payments) && payments
      ? payments.filter((customerPayment) => {
          return (
            customerPayment.payment_source?.type === 'adyen_payments' ||
            customerPayment.payment_method != null
          )
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
  const hasStoredPaymentMethods =
    // @ts-expect-error missing type
    paymentSource?.payment_methods?.storedPaymentMethods != null &&
    // @ts-expect-error missing type
    paymentSource?.payment_methods?.storedPaymentMethods.length > 0
  if (!isGuest && templateCustomerCards) {
    return (
      <>
        {hasStoredPaymentMethods || isEmpty(customerPayments) ? null : (
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
          config={paymentConfig}
        />
      </>
    )
  }
  return (
    <AdyenPayment
      clientKey={clientKey}
      locale={locale}
      config={paymentConfig}
      environment={environment}
    />
  )
}

export default AdyenGateway
