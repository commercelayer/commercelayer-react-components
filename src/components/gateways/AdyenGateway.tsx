import { GatewayBaseType } from '#components/PaymentGateway'
import CommerceLayerContext from '#context/CommerceLayerContext'
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
import { Fragment, useContext } from 'react'
import AdyenPayment from '../AdyenPayment'
import PaymentCardsTemplate from '../utils/PaymentCardsTemplate'
import jwt from '#utils/jwt'
import getCardDetails from '#utils/getCardDetails'

type AdyenGateway = GatewayBaseType

export default function AdyenGateway(props: AdyenGateway) {
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
  // @ts-ignore
  const paymentMethods = paymentSource?.payment_methods
  if (!readonly && payment?.id !== currentPaymentMethodId) return null
  // @ts-ignore
  const clientKey = paymentSource?.public_key
  const environment = jwt(accessToken).test ? 'test' : 'live'
  const adyenConfig = config
    ? getPaymentConfig<'adyenPayment'>(paymentResource, config)
    : {}
  const customerPayments =
    !isEmpty(payments) && payments
      ? payments.filter((customerPayment) => {
          return customerPayment.payment_source?.type === 'adyen_payments'
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
    return isEmpty(card) ? null : (
      <PaymentSourceContext.Provider value={value}>
        {children}
      </PaymentSourceContext.Provider>
    )
  }

  if (!isGuest && templateCustomerCards) {
    // @ts-ignore
    return clientKey && !loading && paymentMethods ? (
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
          config={adyenConfig}
        />
      </Fragment>
    ) : (
      loaderComponent
    )
  }
  // @ts-ignore
  return clientKey && !loading && paymentMethods ? (
    <AdyenPayment clientKey={clientKey} locale={locale} config={adyenConfig} />
  ) : (
    loaderComponent
  )
}
