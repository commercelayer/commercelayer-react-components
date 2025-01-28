import type { GatewayBaseType } from '#components/payment_gateways/PaymentGateway'
import PaypalPayment from '#components/payment_source/PaypalPayment'
import OrderContext from '#context/OrderContext'
import PaymentMethodChildrenContext from '#context/PaymentMethodChildrenContext'
import PaymentMethodContext from '#context/PaymentMethodContext'
import PaymentSourceContext from '#context/PaymentSourceContext'
import type { PaymentResource } from '#reducers/PaymentMethodReducer'
import getCardDetails from '#utils/getCardDetails'
import { getPaymentAttributes } from '#utils/getPaymentAttributes'
import isEmpty from 'lodash/isEmpty'
import { useContext, type JSX } from 'react';

type Props = Partial<GatewayBaseType>

export function PaypalGateway(props: Props): JSX.Element | null {
  const { readonly, showCard, handleEditClick, children, ...p } = props
  const { order } = useContext(OrderContext)
  const { payment } = useContext(PaymentMethodChildrenContext)
  const { currentPaymentMethodId, config, paymentSource } =
    useContext(PaymentMethodContext)
  const paymentResource: PaymentResource = 'paypal_payments'

  if (!readonly && payment?.id !== currentPaymentMethodId) return null
  if (readonly) {
    const card = getCardDetails({
      customerPayment: {
        payment_source: order?.payment_source || paymentSource
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
  const attributes = getPaymentAttributes({
    resource: paymentResource,
    config: config ?? {},
    keys: ['paypal_payments']
  })
  const infoMessage = attributes?.paypalPayment?.infoMessage
  delete p.show
  delete p.templateCustomerCards
  delete p.templateCustomerSaveToWallet
  delete p.loading
  delete p.loaderComponent
  delete p.onClickCustomerCards
  return <PaypalPayment {...p} infoMessage={infoMessage} />
}

export default PaypalGateway
