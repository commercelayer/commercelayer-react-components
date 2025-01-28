import type { GatewayBaseType } from '#components/payment_gateways/PaymentGateway'
import WireTransferPayment from '#components/payment_source/WireTransferPayment'
import OrderContext from '#context/OrderContext'
import PaymentMethodChildrenContext from '#context/PaymentMethodChildrenContext'
import PaymentMethodContext from '#context/PaymentMethodContext'
import PaymentSourceContext from '#context/PaymentSourceContext'
import {
  getPaymentConfig,
  type PaymentResource
} from '#reducers/PaymentMethodReducer'
import getCardDetails from '#utils/getCardDetails'
import isEmpty from 'lodash/isEmpty'
import { useContext, type JSX } from 'react';

type Props = GatewayBaseType

export function WireTransferGateway(props: Props): JSX.Element | null {
  const { readonly, showCard, handleEditClick, children, ...p } = props
  const { payment } = useContext(PaymentMethodChildrenContext)
  const { order } = useContext(OrderContext)
  const { currentPaymentMethodId, config, paymentSource } =
    useContext(PaymentMethodContext)
  const paymentResource: PaymentResource = 'wire_transfers'

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
  const wireTransferConfig =
    config && paymentResource
      ? getPaymentConfig<'wire_transfers'>(paymentResource, config)
      : {}
  return <WireTransferPayment {...p} {...wireTransferConfig?.wireTransfer} />
}

export default WireTransferGateway
