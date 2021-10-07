import { GatewayBaseType } from '#components/PaymentGateway'
import PaypalPayment from '#components/PaypalPayment'
import PaymentMethodChildrenContext from '#context/PaymentMethodChildrenContext'
import PaymentMethodContext from '#context/PaymentMethodContext'
import PaymentSourceContext from '#context/PaymentSourceContext'
import {
  getPaymentConfig,
  PaymentResource,
} from '#reducers/PaymentMethodReducer'
import isEmpty from 'lodash/isEmpty'
import React, { useContext } from 'react'

type PaypalGateway = GatewayBaseType

export default function PaypalGateway(props: PaypalGateway) {
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
  const paymentResource: PaymentResource = 'stripe_payments'

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
  const paypalConfig =
    config && getPaymentConfig<'paypalPayment'>(paymentResource, config)
  return <PaypalPayment {...p} infoMessage={paypalConfig?.infoMessage} />
}
