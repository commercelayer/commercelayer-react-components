import { type JSX, useContext, useEffect, useState } from "react"
import CustomerContext from "#context/CustomerContext"
import OrderContext from "#context/OrderContext"
import PaymentMethodChildrenContext from "#context/PaymentMethodChildrenContext"
import PaymentMethodContext from "#context/PaymentMethodContext"
import PlaceOrderContext from "#context/PlaceOrderContext"
import type { PaymentResource } from "#reducers/PaymentMethodReducer"
import type { LoaderType } from "#typings"
import getLoaderComponent from "#utils/getLoaderComponent"
import {
  getCkoAttributes,
  getExternalPaymentAttributes,
  getPaypalAttributes,
  getStripeAttributes,
} from "#utils/getPaymentAttributes"
import type { PaymentSourceProps } from "../payment_source/PaymentSource"
import AdyenGateway from "./AdyenGateway"
import BraintreeGateway from "./BraintreeGateway"
import CheckoutComGateway from "./CheckoutComGateway"
import ExternalGateway from "./ExternalGateway"
import KlarnaGateway from "./KlarnaGateway"
import PaypalGateway from "./PaypalGateway"
import StripeGateway from "./StripeGateway"
import WireTransferGateway from "./WireTransferGateway"

export type GatewayBaseType = Props & {
  show: boolean
  loading: boolean
  loaderComponent: JSX.Element
}

type Props = PaymentSourceProps & {
  showCard: boolean
  handleEditClick: (e: MouseEvent) => void
  show: boolean
  loader?: LoaderType
}

export function PaymentGateway({
  readonly,
  showCard,
  handleEditClick,
  children,
  templateCustomerCards,
  templateCustomerSaveToWallet,
  onClickCustomerCards,
  show,
  loader = "Loading...",
  ...p
}: Props): JSX.Element | null {
  const loaderComponent = getLoaderComponent(loader)
  const [loading, setLoading] = useState(true)
  const { payment, expressPayments } = useContext(PaymentMethodChildrenContext)
  const { order } = useContext(OrderContext)
  const { getCustomerPaymentSources } = useContext(CustomerContext)
  const { status } = useContext(PlaceOrderContext)
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
      order?.payment_method?.payment_source_type === paymentResource &&
      !expressPayments
    ) {
      let attributes: Record<string, unknown> | undefined = {}
      if (config != null && paymentResource === "paypal_payments") {
        attributes = getPaypalAttributes(paymentResource, config)
      }
      if (config != null && paymentResource === "external_payments") {
        attributes = getExternalPaymentAttributes(paymentResource, config)
      }
      if (config != null && paymentResource === "stripe_payments") {
        attributes = getStripeAttributes(paymentResource, config)
        if (attributes != null && attributes["return_url"] == null) {
          attributes["return_url"] = window.location.href
        }
      }
      if (config != null && paymentResource === "checkout_com_payments") {
        attributes = getCkoAttributes(paymentResource, config)
      }
      const setPaymentSources = async (): Promise<void> => {
        if (order != null) {
          await setPaymentSource({
            paymentResource,
            order,
            attributes,
          })
        }
        if (getCustomerPaymentSources) getCustomerPaymentSources()
      }
      if (
        !paymentSource &&
        order?.payment_method.id &&
        show &&
        !expressPayments
      ) {
        setPaymentSources()
      } else if (
        ((!paymentSource && !expressPayments) ||
          paymentSource?.type !== paymentResource) &&
        show
      ) {
        setPaymentSources()
      }
      // @ts-expect-error no type
      if (paymentSource?.mismatched_amounts && show) {
        setPaymentSources()
      }
      if (order?.payment_source?.id != null) {
        setLoading(false)
      }
      if (!paymentSource) {
        setLoading(true)
      }
    }
    if (expressPayments && show) setLoading(false)
    if (
      order?.status != null &&
      !["draft", "pending"].includes(order?.status) &&
      show &&
      order?.payment_source?.id != null
    ) {
      setLoading(false)
    }
    return () => {
      setLoading(true)
    }
  }, [order?.payment_method?.id, show, paymentSource?.id])

  useEffect(() => {
    if (status === "placing") setLoading(true)
    if (status === "standby" && loading) setLoading(false)
    if (order && order.status === "placed" && loading) {
      setLoading(false)
    }
    return () => {
      setLoading(true)
    }
  }, [status, order?.status])

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
  if (currentPaymentMethodType !== paymentResource) return null
  if (loading) return loaderComponent
  switch (paymentResource) {
    case "adyen_payments":
      return <AdyenGateway {...gatewayConfig}>{children}</AdyenGateway>
    case "braintree_payments":
      return <BraintreeGateway {...gatewayConfig}>{children}</BraintreeGateway>
    case "checkout_com_payments":
      return (
        <CheckoutComGateway {...gatewayConfig}>{children}</CheckoutComGateway>
      )
    case "external_payments":
      return <ExternalGateway {...gatewayConfig}>{children}</ExternalGateway>
    case "klarna_payments":
      return <KlarnaGateway {...gatewayConfig}>{children}</KlarnaGateway>
    case "stripe_payments":
      return <StripeGateway {...gatewayConfig}>{children}</StripeGateway>
    case "wire_transfers":
      return (
        <WireTransferGateway {...gatewayConfig}>{children}</WireTransferGateway>
      )
    case "paypal_payments":
      return <PaypalGateway {...gatewayConfig}>{children}</PaypalGateway>
    default:
      return null
  }
}

export default PaymentGateway
