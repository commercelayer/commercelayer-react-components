import Parent from '#components/utils/Parent'
import { useContext } from 'react'
import PaymentMethodContext from '#context/PaymentMethodContext'
import {
  type PaymentResource,
  type PaymentSourceType
} from '#reducers/PaymentMethodReducer'
import PaymentSourceContext, {
  type IconBrand
} from '#context/PaymentSourceContext'
import { type ChildrenFunction } from '#typings'
import getCardDetails from '#utils/getCardDetails'

interface ChildrenProps extends Pick<Props, 'customerPayments'> {
  PaymentSourceProvider: typeof PaymentSourceContext.Provider
}

type CustomerPayment = PaymentSourceType & {
  card?: {
    brand?: IconBrand
    last4?: string
  }
  handleClick?: () => void
}

export type CustomerCardsTemplateChildren = ChildrenFunction<ChildrenProps>

interface Props {
  customerPayments: CustomerPayment[]
  children: CustomerCardsTemplateChildren
  paymentResource: PaymentResource
}

export default function PaymentCardsTemplate({
  customerPayments,
  children,
  paymentResource
}: Props): JSX.Element {
  const { setPaymentSource } = useContext(PaymentMethodContext)
  const payments = customerPayments.map((customerPayment) => {
    const attributes = customerPayment
    const card = getCardDetails({
      customerPayment,
      paymentType: paymentResource
    })
    const handleClick = async (e: MouseEvent): Promise<void> => {
      e.stopPropagation()
      await setPaymentSource({
        paymentResource,
        customerPaymentSourceId: customerPayment.id
      })
    }
    return { ...attributes, card, handleClick }
  })
  const value = {
    customerPayments: payments,
    PaymentSourceProvider: PaymentSourceContext.Provider
  }
  return <Parent {...value}>{children}</Parent>
}
