import { useContext, useState, useEffect, type JSX } from "react"
import PaymentMethodChildrenContext from "#context/PaymentMethodChildrenContext"
import PaymentMethodContext from "#context/PaymentMethodContext"
import CustomerContext from "#context/CustomerContext"
import PaymentGateway from "../payment_gateways/PaymentGateway"
import type { PaymentResource } from "#reducers/PaymentMethodReducer"
import type { LoaderType } from "#typings/index"
import type { CustomerCardsTemplateChildren } from "../utils/PaymentCardsTemplate"
import getCardDetails from "#utils/getCardDetails"
import OrderContext from "#context/OrderContext"

export interface CustomerCardsProps {
  handleClick: () => void
}

export interface CustomerSaveToWalletProps {
  name: "save_payment_source_to_customer_wallet"
}

export interface PaymentSourceProps
  extends Omit<JSX.IntrinsicElements["div"], "children"> {
  children?: JSX.Element | JSX.Element[]
  readonly?: boolean
  templateCustomerCards?: CustomerCardsTemplateChildren
  onClickCustomerCards?: () => void
  templateCustomerSaveToWallet?: (
    props: CustomerSaveToWalletProps,
  ) => JSX.Element
  loader?: LoaderType
}

export function PaymentSource(props: PaymentSourceProps): JSX.Element {
  const { readonly } = props
  const { payment, expressPayments } = useContext(PaymentMethodChildrenContext)
  const { order } = useContext(OrderContext)
  const { payments } = useContext(CustomerContext)
  const {
    currentPaymentMethodId,
    paymentSource,
    destroyPaymentSource,
    currentPaymentMethodType,
    currentCustomerPaymentSourceId,
  } = useContext(PaymentMethodContext)
  const [show, setShow] = useState(false)
  const [showCard, setShowCard] = useState(false)

  useEffect(() => {
    const isCustomerPaymentSource =
      currentCustomerPaymentSourceId != null &&
      currentCustomerPaymentSourceId === paymentSource?.id
    if (readonly) {
      setShow(true)
      setShowCard(true)
    } else if (
      (payment?.id === currentPaymentMethodId || isCustomerPaymentSource) &&
      !expressPayments
    ) {
      const card = getCardDetails({
        paymentType: payment?.payment_source_type as PaymentResource,
        customerPayment: {
          payment_source: paymentSource,
        },
      })
      if (isCustomerPaymentSource && card.brand === "") {
        // Force creadit card icon for customer payment source imported by API
        card.brand =
          card.issuer_type != null && card.issuer_type !== ""
            ? card.issuer_type
            : "credit-card"
      }
      if (card.brand) {
        setShowCard(true)
      }
      setShow(true)
    } else if (
      expressPayments &&
      currentPaymentMethodType === "stripe_payments"
    ) {
      setShow(true)
    }
    return () => {
      setShow(false)
      setShowCard(false)
    }
  }, [
    currentPaymentMethodId,
    paymentSource?.id,
    payments != null,
    payment != null,
    readonly,
    order?.status,
    expressPayments,
  ])
  const handleEditClick = async (e: MouseEvent): Promise<void> => {
    e.stopPropagation()
    if (paymentSource) {
      const paymentSourceId = paymentSource?.id
      await destroyPaymentSource({
        paymentSourceId,
        paymentResource: payment?.payment_source_type as PaymentResource,
      })
    }
    setShowCard(!showCard)
    setShow(true)
  }
  const gatewayProps = { ...props, show, showCard, handleEditClick, readonly }
  return <PaymentGateway {...gatewayProps} />
}

export default PaymentSource
