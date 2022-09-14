import { useContext, ReactNode, useState, useEffect } from 'react'
import PaymentMethodChildrenContext from '#context/PaymentMethodChildrenContext'
import components from '#config/components'
import PaymentMethodContext from '#context/PaymentMethodContext'
import CustomerContext from '#context/CustomerContext'
import PaymentGateway from '../payment_gateways/PaymentGateway'
import { PaymentResource } from '#reducers/PaymentMethodReducer'
import { LoaderType } from '#typings/index'
import { CustomerCardsTemplateChildren } from '../utils/PaymentCardsTemplate'
import getCardDetails from '../../utils/getCardDetails'
import OrderContext from '#context/OrderContext'

const propTypes = components.PaymentSource.propTypes
const displayName = components.PaymentSource.displayName

export type CustomerCardsProps = {
  handleClick: () => void
}

export type CustomerSaveToWalletProps = {
  name: 'save_payment_source_to_customer_wallet'
}

export type PaymentSourceProps = {
  children?: ReactNode
  readonly?: boolean
  templateCustomerCards?: CustomerCardsTemplateChildren
  onClickCustomerCards?: () => void
  templateCustomerSaveToWallet?: (
    props: CustomerSaveToWalletProps
  ) => JSX.Element
  loader?: LoaderType
} & JSX.IntrinsicElements['div']

export function PaymentSource(props: PaymentSourceProps) {
  const { readonly } = props
  const { payment } = useContext(PaymentMethodChildrenContext)
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
          payment_source: paymentSource,
        },
      })
      if (card.brand) setShowCard(true)
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
    order,
  ])
  const handleEditClick = async (e: MouseEvent) => {
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

PaymentSource.propTypes = propTypes
PaymentSource.displayName = displayName

export default PaymentSource
