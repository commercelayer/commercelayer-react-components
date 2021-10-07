import OrderContext from '#context/OrderContext'
import PaymentMethodChildrenContext from '#context/PaymentMethodChildrenContext'
import PaymentMethodContext from '#context/PaymentMethodContext'
import { PaymentResource } from '#reducers/PaymentMethodReducer'
import { LoaderType } from '#typings'
import getPaypalConfig from '#utils/paypalPayment'
import React, {
  FunctionComponent,
  useContext,
  useEffect,
  useState,
} from 'react'
import { PaymentSourceProps } from './PaymentSource'
import getLoaderComponent from '#utils/getLoaderComponent'
import AdyenGateway from './gateways/AdyenGateway'
import StripeGateway from './gateways/StripeGateway'
import BraintreeGateway from './gateways/BraintreeGateway'
import PaypalGateway from './gateways/PaypalGateway'
import WireTransferGateway from './gateways/WireTransferGateway'

export type GatewayBaseType = PaymentGatewayProps & {
  show: boolean
  loading: boolean
  loaderComponent: JSX.Element
}

export type PaymentGatewayProps = PaymentSourceProps & {
  showCard: boolean
  handleEditClick: () => void
  show: boolean
  loader?: LoaderType
}

const PaymentGateway: FunctionComponent<PaymentGatewayProps> = ({
  readonly,
  showCard,
  handleEditClick,
  children,
  templateCustomerCards,
  templateCustomerSaveToWallet,
  onClickCustomerCards,
  show,
  loader = 'Loading...',
  ...p
}) => {
  const loaderComponent = getLoaderComponent(loader)
  const [loading, setLoading] = useState(true)
  const { payment } = useContext(PaymentMethodChildrenContext)
  const { order } = useContext(OrderContext)
  const {
    currentPaymentMethodId,
    config,
    paymentSource,
    currentPaymentMethodType,
    setPaymentSource,
  } = useContext(PaymentMethodContext)
  const paymentResource = readonly
    ? currentPaymentMethodType
    : (payment?.paymentSourceType as PaymentResource)
  useEffect(() => {
    if (
      paymentResource &&
      !paymentSource &&
      payment?.id === currentPaymentMethodId &&
      order
    ) {
      const attributes =
        config && paymentResource === 'paypal_payments'
          ? getPaypalConfig(paymentResource, config)
          : {}
      setPaymentSource({
        paymentResource,
        order,
        attributes,
      })
    }
    if (paymentSource) setLoading(false)
    return () => {
      setLoading(true)
    }
  }, [paymentSource, payment, show])
  const gatewayConfig = {
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
    ...p,
  }
  switch (paymentResource) {
    case 'stripe_payments':
      return <StripeGateway {...gatewayConfig}>{children}</StripeGateway>
    case 'adyen_payments':
      return <AdyenGateway {...gatewayConfig}>{children}</AdyenGateway>
    case 'braintree_payments':
      return <BraintreeGateway {...gatewayConfig}>{children}</BraintreeGateway>
    case 'wire_transfers':
      return (
        <WireTransferGateway {...gatewayConfig}>{children}</WireTransferGateway>
      )
    case 'paypal_payments':
      return <PaypalGateway {...gatewayConfig}>{children}</PaypalGateway>
    default:
      return null
  }
}

export default PaymentGateway
