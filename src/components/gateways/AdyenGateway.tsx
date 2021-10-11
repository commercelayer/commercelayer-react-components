import { GatewayBaseType } from '#components/PaymentGateway'
import Parent from '#components/utils/Parent'
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
  const { currentPaymentMethodId, config, paymentSource, setPaymentSource } =
    useContext(PaymentMethodContext)
  const paymentResource: PaymentResource = 'adyen_payments'
  const locale = order?.languageCode as StripeElementLocale

  if (!readonly && payment?.id !== currentPaymentMethodId) return null

  const clientKey =
    // @ts-ignore
    paymentSource?.publicKey
  // TODO: Check
  const environment = 'test'
  const adyenConfig = config
    ? getPaymentConfig<'stripePayment'>(paymentResource, config)
    : {}
  const adyenCustomerPayments =
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
    const customerPaymentsCards = adyenCustomerPayments.map(
      (customerPayment, i) => {
        const card =
          // @ts-ignore
          customerPayment?.paymentSource()?.paymentRequestData?.paymentMethod ||
          // @ts-ignore
          (customerPayment?.paymentSource()?.metadata?.card as Record<
            string,
            any
          >)
        const handleClick = async () => {
          const p = await setPaymentSource({
            paymentResource,
            customerPaymentSourceId: customerPayment.id,
          })
          const attributes: any = {
            _authorize: 1,
          }
          const pSource = await setPaymentSource({
            paymentResource,
            attributes,
            paymentSourceId: p?.paymentSource.id,
          })
          const resultCode =
            // @ts-ignore
            pSource?.paymentSource?.paymentResponse?.resultCode === 'Authorised'
          if (resultCode) onClickCustomerCards && onClickCustomerCards()
        }
        const value = {
          ...card,
          showCard,
          handleEditClick,
          readonly,
          handleClick,
        }
        return (
          <PaymentSourceContext.Provider key={i} value={value}>
            <Parent {...value}>{templateCustomerCards}</Parent>
          </PaymentSourceContext.Provider>
        )
      }
    )
    // @ts-ignore
    return clientKey && !loading && paymentSource?.paymentMethods ? (
      <Fragment>
        {isEmpty(customerPaymentsCards) ? null : (
          <div className={p.className}>{customerPaymentsCards}</div>
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
