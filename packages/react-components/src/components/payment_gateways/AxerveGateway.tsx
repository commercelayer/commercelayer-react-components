import { GatewayBaseType } from '#components/payment_gateways/PaymentGateway'
import CommerceLayerContext from '#context/CommerceLayerContext'
import CustomerContext from '#context/CustomerContext'
// import OrderContext from '#context/OrderContext'
import PaymentMethodChildrenContext from '#context/PaymentMethodChildrenContext'
import PaymentMethodContext from '#context/PaymentMethodContext'
import PaymentSourceContext from '#context/PaymentSourceContext'
import { PaymentResource } from '#reducers/PaymentMethodReducer'
// import { StripeElementLocale } from '@stripe/stripe-js'
import isEmpty from 'lodash/isEmpty'
import { useContext } from 'react'
import AxervePayment from '#components/payment_source/AxervePayment'
import PaymentCardsTemplate from '../utils/PaymentCardsTemplate'
import jwt from '#utils/jwt'
import getCardDetails from '#utils/getCardDetails'
// import { getPaymentAttributes } from '#utils/getPaymentAttributes'

type Props = GatewayBaseType

export function AxerveGateway(props: Props): JSX.Element | null {
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
  // const { order } = useContext(OrderContext)
  const { accessToken } = useContext(CommerceLayerContext)
  const { payment } = useContext(PaymentMethodChildrenContext)
  const { payments, isGuest } = useContext(CustomerContext)
  const { currentPaymentMethodId, paymentSource } =
    useContext(PaymentMethodContext)
  const paymentResource: PaymentResource = 'axerve_payments'
  // const locale = order?.language_code as StripeElementLocale
  // @ts-expect-error
  const paymentMethods = paymentSource?.payment_methods
  if (!readonly && payment?.id !== currentPaymentMethodId) return null
  // @ts-expect-error
  const paymentId = paymentSource?.payment_id
  // @ts-expect-error
  const paymentToken = paymentSource?.payment_token
  // @ts-expect-error
  const shopLogin = paymentSource?.login
  const environment = accessToken && jwt(accessToken).test ? 'test' : 'live'
  // const gtwConfig = getPaymentAttributes({
  //   resource: paymentResource,
  //   config: config ?? {},
  //   keys: ['axerve_payments']
  // })
  const customerPayments =
    !isEmpty(payments) && payments
      ? payments.filter((customerPayment) => {
          return customerPayment.payment_source?.type === 'axerve_payments'
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
    return paymentId && paymentToken && !loading && paymentMethods ? (
      <>
        {isEmpty(customerPayments) ? null : (
          <div className={p.className}>
            <PaymentCardsTemplate {...{ paymentResource, customerPayments }}>
              {templateCustomerCards}
            </PaymentCardsTemplate>
          </div>
        )}
        <AxervePayment
          templateCustomerSaveToWallet={templateCustomerSaveToWallet}
          paymentId={paymentId}
          paymentToken={paymentToken}
          environment={environment}
          shopLogin={shopLogin}
        />
      </>
    ) : (
      loaderComponent
    )
  }
  return paymentId && paymentToken && !loading && paymentMethods ? (
    <AxervePayment
      paymentId={paymentId}
      paymentToken={paymentToken}
      environment={environment}
      shopLogin={shopLogin}
    />
  ) : (
    loaderComponent
  )
}

export default AxerveGateway
