import { GatewayBaseType } from '#components/PaymentGateway'
import StripePayment from '#components/StripePayment'
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

type StripeGateway = GatewayBaseType

export default function StripeGateway(props: StripeGateway) {
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
  const paymentResource: PaymentResource = 'stripe_payments'
  const locale = order?.languageCode as StripeElementLocale

  if (!readonly && payment?.id !== currentPaymentMethodId) return null

  // @ts-ignore
  const publishableKey = paymentSource?.publishableKey
  const stripeConfig = config
    ? getPaymentConfig<'stripePayment'>(paymentResource, config)
    : {}
  const customerPayments =
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
    const customerPaymentsCards = customerPayments.map((customerPayment, i) => {
      // @ts-ignore
      const card = customerPayment?.paymentSource()?.options?.card as Record<
        string,
        any
      >
      debugger
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
    })
    return (
      <Fragment>
        {isEmpty(customerPaymentsCards) ? null : (
          <div className={p.className}>{customerPaymentsCards}</div>
        )}
        <StripePayment
          show={show}
          templateCustomerSaveToWallet={templateCustomerSaveToWallet}
          publishableKey={publishableKey}
          locale={locale}
          {...stripeConfig}
        />
      </Fragment>
    )
  }

  return publishableKey && !loading ? (
    <StripePayment
      show={show}
      publishableKey={publishableKey}
      locale={locale}
      {...stripeConfig}
    />
  ) : (
    loaderComponent
  )
}
