import { GatewayBaseType } from '#components/PaymentGateway'
import WireTransferPayment from '#components/WireTransferPayment'
import PaymentMethodChildrenContext from '#context/PaymentMethodChildrenContext'
import PaymentMethodContext from '#context/PaymentMethodContext'
import PaymentSourceContext from '#context/PaymentSourceContext'
import {
  getPaymentConfig,
  PaymentResource,
} from '#reducers/PaymentMethodReducer'
import isEmpty from 'lodash/isEmpty'
import React, { useContext } from 'react'

type WireTransferGateway = GatewayBaseType

export default function WireTransferGateway(props: WireTransferGateway) {
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
  const { payment } = useContext(PaymentMethodChildrenContext)
  const { currentPaymentMethodId, config, paymentSource } =
    useContext(PaymentMethodContext)
  const paymentResource: PaymentResource = 'wire_transfers'

  if (!readonly && payment?.id !== currentPaymentMethodId) return null
  if (readonly || showCard) {
    const card =
      // @ts-ignore
      paymentSource?.options?.card ||
      // @ts-ignore
      (paymentSource?.metadata?.card as Record<string, any>)
    const value = { ...card, showCard, handleEditClick, readonly }
    return isEmpty(card) ? null : (
      <PaymentSourceContext.Provider value={value}>
        {children}
      </PaymentSourceContext.Provider>
    )
  }
  const wireTransferConfig =
    config && paymentResource
      ? getPaymentConfig<'wireTransfer'>(paymentResource, config)
      : {}
  return <WireTransferPayment {...p} {...wireTransferConfig} />
}
