import React, {
  useContext,
  FunctionComponent,
  ReactNode,
  useState,
  useEffect,
} from 'react'
import PaymentMethodChildrenContext from '#context/PaymentMethodChildrenContext'
import components from '#config/components'
import PaymentMethodContext from '#context/PaymentMethodContext'
import { isEmpty } from 'lodash'
import CustomerContext from '#context/CustomerContext'
import PaymentGateway from './PaymentGateway'

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
  templateCustomerCards?: (props: CustomerCardsProps) => ReactNode
  templateCustomerSaveToWallet?: (props: CustomerSaveToWalletProps) => ReactNode
} & JSX.IntrinsicElements['div']

const PaymentSource: FunctionComponent<PaymentSourceProps> = (props) => {
  const { readonly } = props
  const { payment } = useContext(PaymentMethodChildrenContext)
  const { payments } = useContext(CustomerContext)
  const { currentPaymentMethodId, paymentSource } = useContext(
    PaymentMethodContext
  )
  const [show, setShow] = useState(false)
  const [showCard, setShowCard] = useState(false)

  useEffect(() => {
    if (readonly) {
      setShow(true)
      setShowCard(true)
    } else if (payment?.id === currentPaymentMethodId) {
      setShow(true)
      if (!isEmpty(paymentSource)) setShowCard(true)
    } else setShow(false)
    return () => {
      setShow(false)
      setShowCard(false)
    }
  }, [currentPaymentMethodId, paymentSource, payments, payment, readonly])
  const handleEditClick = () => setShowCard(!showCard)
  return (
    <PaymentGateway
      {...{ ...props, show, showCard, handleEditClick, readonly }}
    />
  )
}

PaymentSource.propTypes = propTypes
PaymentSource.displayName = displayName

export default PaymentSource
