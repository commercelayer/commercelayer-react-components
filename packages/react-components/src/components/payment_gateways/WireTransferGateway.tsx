import { type GatewayBaseType } from '#components/payment_gateways/PaymentGateway'
import WireTransferPayment from '#components/payment_source/WireTransferPayment'
import PaymentMethodChildrenContext from '#context/PaymentMethodChildrenContext'
import PaymentMethodContext from '#context/PaymentMethodContext'
import PaymentSourceContext from '#context/PaymentSourceContext'
import {
  getPaymentConfig,
  type PaymentResource
} from '#reducers/PaymentMethodReducer'
import isEmpty from 'lodash/isEmpty'
import { useContext } from 'react'

type Props = GatewayBaseType

export function WireTransferGateway(props: Props): JSX.Element | null {
  const { readonly, showCard, handleEditClick, children, ...p } = props
  const { payment } = useContext(PaymentMethodChildrenContext)
  const { currentPaymentMethodId, config, paymentSource } =
    useContext(PaymentMethodContext)
  const paymentResource: PaymentResource = 'wire_transfers'

  if (!readonly && payment?.id !== currentPaymentMethodId) return null
  if (readonly || showCard) {
    const card =
      // @ts-expect-error no type
      paymentSource?.options?.card || paymentSource?.metadata?.card
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
  return <WireTransferPayment {...p} {...wireTransferConfig} />
}

export default WireTransferGateway
