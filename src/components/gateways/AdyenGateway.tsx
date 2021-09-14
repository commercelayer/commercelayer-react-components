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

  // @ts-ignore
  const clientKey =
    paymentSource?.publicKey ||
    'pub.v2.8216287005010266.aHR0cDovL2xvY2FsaG9zdDozMDAw.sXlUbjw_mJsSMpq58JkAFU0sLCTnLkD6fuiOd-c1pSc' // TODO: remove conditional check
  const adyenConfig = config
    ? getPaymentConfig<'stripePayment'>(paymentResource, config)
    : {}
  const adyenCustomerPayments =
    !isEmpty(payments) && payments
      ? payments.filter((customerPayment) => {
          return customerPayment.paymentSourceType === 'StripePayment'
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
    const customerPaymentsCards = adyenCustomerPayments.map(
      (customerPayment, i) => {
        // @ts-ignore
        const card = customerPayment?.paymentSource()?.options?.card as Record<
          string,
          any
        >
        const handleClick = async () => {
          await setPaymentSource({
            paymentResource,
            customerPaymentSourceId: customerPayment.id,
          })
          onClickCustomerCards && onClickCustomerCards()
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
    return (
      <Fragment>
        {isEmpty(customerPaymentsCards) ? null : (
          <div className={p.className}>{customerPaymentsCards}</div>
        )}
        <AdyenPayment
          templateCustomerSaveToWallet={templateCustomerSaveToWallet}
          clientKey={clientKey}
          locale={locale}
          {...adyenConfig}
        />
      </Fragment>
    )
  }

  return clientKey && !loading ? (
    <AdyenPayment clientKey={clientKey} locale={locale} {...adyenConfig} />
  ) : (
    loaderComponent
  )
}
