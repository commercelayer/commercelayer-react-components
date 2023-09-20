import { useContext, useState, useEffect } from 'react'
import PaymentMethodChildrenContext from '#context/PaymentMethodChildrenContext'
import PaymentMethodContext from '#context/PaymentMethodContext'
import CustomerContext from '#context/CustomerContext'
import PaymentGateway from '../payment_gateways/PaymentGateway'
import { type PaymentResource } from '#reducers/PaymentMethodReducer'
import { type LoaderType } from '#typings/index'
import { type CustomerCardsTemplateChildren } from '../utils/PaymentCardsTemplate'
import getCardDetails from '#utils/getCardDetails'
import OrderContext from '#context/OrderContext'

export interface CustomerCardsProps {
  handleClick: () => void
}

export interface CustomerSaveToWalletProps {
  name: 'save_payment_source_to_customer_wallet'
}

export interface PaymentSourceProps
  extends Omit<JSX.IntrinsicElements['div'], 'children'> {
  children?: JSX.Element | JSX.Element[]
  readonly?: boolean
  templateCustomerCards?: CustomerCardsTemplateChildren
  onClickCustomerCards?: () => void
  templateCustomerSaveToWallet?: (
    props: CustomerSaveToWalletProps
  ) => JSX.Element
  loader?: LoaderType
}

export function PaymentSource(props: PaymentSourceProps): JSX.Element {
  const { readonly } = props
  const { payment, expressPayments } = useContext(PaymentMethodChildrenContext)
  const { order } = useContext(OrderContext)
  const { payments } = useContext(CustomerContext)
  const { currentPaymentMethodId, paymentSource, destroyPaymentSource } =
    useContext(PaymentMethodContext)
  const [show, setShow] = useState(false)
  const [showCard, setShowCard] = useState(false)

  useEffect(() => {
    if (readonly) {
      setShow(true)
      setShowCard(true)
    } else if (payment?.id === currentPaymentMethodId) {
      setShow(true)
      const card = getCardDetails({
        paymentType: payment?.payment_source_type as PaymentResource,
        customerPayment: {
          // @ts-expect-error missing type
          payment_source: paymentSource
        }
      })
      if (card.brand) setShowCard(true)
    } else if (expressPayments) {
      setShow(true)
    } else setShow(false)
    return () => {
      setShow(false)
      setShowCard(false)
    }
  }, [
    currentPaymentMethodId,
    paymentSource,
    payments,
    payment,
    readonly,
    order
  ])
  const handleEditClick = async (e: MouseEvent): Promise<void> => {
    e.stopPropagation()
    if (paymentSource) {
      const paymentSourceId = paymentSource?.id
      await destroyPaymentSource({
        paymentSourceId,
        paymentResource: payment?.payment_source_type as PaymentResource
      })
    }
    setShowCard(!showCard)
    setShow(true)
  }
  const gatewayProps = { ...props, show, showCard, handleEditClick, readonly }
  return <PaymentGateway {...gatewayProps} />
}

export default PaymentSource
