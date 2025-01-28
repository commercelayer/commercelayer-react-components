import Parent from '#components/utils/Parent'
import { useContext, type JSX } from 'react';
import PaymentMethodContext from '#context/PaymentMethodContext'
import type { PaymentResource } from '#reducers/PaymentMethodReducer'
import PaymentSourceContext, {
  type IconBrand
} from '#context/PaymentSourceContext'
import type { ChildrenFunction } from '#typings'
import getCardDetails from '#utils/getCardDetails'
import type { CustomerPaymentSource } from '@commercelayer/sdk'

interface ChildrenProps extends Pick<Props, 'customerPayments'> {
  PaymentSourceProvider: typeof PaymentSourceContext.Provider
}

interface CustomerPayment extends CustomerPaymentSource {
  /**
   * Card details
   */
  card?: {
    /**
     * Card brand
     */
    brand: IconBrand
    /**
     * Card last 4 digits
     */
    last4: string
  }
  /**
   * Handle click event
   */
  handleClick?: () => void
}

export type CustomerCardsTemplateChildren = ChildrenFunction<ChildrenProps>

interface Props {
  /**
   * Customer payments
   */
  customerPayments: CustomerPayment[]
  children: CustomerCardsTemplateChildren
  /**
   * Payment resource
   */
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
    if (card.brand === '') {
      card.brand =
        // @ts-expect-error missing type
        customerPayment.payment_source?.payment_instrument?.issuer_type ??
        'credit-card'
    }
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
