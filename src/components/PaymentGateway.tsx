import OrderContext from '#context/OrderContext'
import PaymentMethodChildrenContext from '#context/PaymentMethodChildrenContext'
import PaymentMethodContext from '#context/PaymentMethodContext'
import { PaymentResource } from '#reducers/PaymentMethodReducer'
import { LoaderType } from '#typings'
import getPaypalConfig from '#utils/paypalPayment'
import { FunctionComponent, useContext, useEffect, useState } from 'react'
import { PaymentSourceProps } from './PaymentSource'
import getLoaderComponent from '#utils/getLoaderComponent'
import StripeGateway from './gateways/StripeGateway'
import PaypalGateway from './gateways/PaypalGateway'
import WireTransferGateway from './gateways/WireTransferGateway'
import CustomerContext from '#context/CustomerContext'
import KlarnaGateway from './gateways/KlarnaGateway'
import MultisafepayGateway from './gateways/MultisafepayGateway'

export type GatewayBaseType = PaymentGatewayProps & {
  show: boolean
  loading: boolean
  loaderComponent: JSX.Element
}

export type PaymentGatewayProps = PaymentSourceProps & {
  showCard: boolean
  handleEditClick: (e: MouseEvent) => void
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
  const { getCustomerPaymentSources } = useContext(CustomerContext)
  const {
    currentPaymentMethodId,
    config,
    currentPaymentMethodType,
    setPaymentSource,
    paymentSource,
  } = useContext(PaymentMethodContext)
  const paymentResource = readonly
    ? currentPaymentMethodType
    : (payment?.payment_source_type as PaymentResource)
  useEffect(() => {
    if (
      payment?.id === currentPaymentMethodId &&
      paymentResource &&
      order?.payment_method?.payment_source_type === paymentResource
    ) {
      const attributes =
        config && paymentResource === 'paypal_payments'
          ? getPaypalConfig(paymentResource, config)
          : {}
      const setPaymentSources = async () => {
        await setPaymentSource({
          paymentResource,
          order,
          attributes,
        })
        getCustomerPaymentSources && (await getCustomerPaymentSources())
      }
      if (!paymentSource && order?.payment_method.id && show) {
        setPaymentSources()
      } else if (!paymentSource || paymentSource.type !== paymentResource) {
        setPaymentSources()
      }
      // @ts-ignore
      if (paymentSource?.mismatched_amounts && show) {
        setPaymentSources()
      }
      setLoading(false)
    }
    return () => {
      setLoading(true)
    }
  }, [order?.payment_method?.id, show, paymentSource])
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
    case 'klarna_payments':
      return <KlarnaGateway {...gatewayConfig}>{children}</KlarnaGateway>
    case 'wire_transfers':
      return (
        <WireTransferGateway {...gatewayConfig}>{children}</WireTransferGateway>
      )
    case 'paypal_payments':
      return <PaypalGateway {...gatewayConfig}>{children}</PaypalGateway>
    case "external_payments":
      if (
        order?.payment_method?.reference_origin?.toUpperCase() === "MULTISAFEPAY"
      ) {
        return (
          <MultisafepayGateway {...gatewayConfig}>
            {children}
          </MultisafepayGateway>
        )
      }
      return null
    default:
      return null
  }
}

export default PaymentGateway
