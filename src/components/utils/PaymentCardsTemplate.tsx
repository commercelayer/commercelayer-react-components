import Parent from '#components/utils/Parent'
import React, { useContext } from 'react'
import PaymentMethodContext from '#context/PaymentMethodContext'
import {
  PaymentResource,
  PaymentSourceType,
} from '#reducers/PaymentMethodReducer'
import PaymentSourceContext, { iconBrand } from '#context/PaymentSourceContext'
import { FunctionChildren } from '#typings'
import getCardDetails from '#utils/getCardDetails'

type ChildrenProps = Pick<Props, 'customerPayments'> & {
  PaymentSourceProvider: typeof PaymentSourceContext.Provider
}

type CustomerPayment = PaymentSourceType & {
  card?: {
    brand?: iconBrand
    last4?: string
  }
  handleClick?: () => void
}

export type CustomerCardsTemplateChildren = FunctionChildren<ChildrenProps>

export type CustomerCardsType = ChildrenProps

type Props = {
  customerPayments: CustomerPayment[]
  children: CustomerCardsTemplateChildren
  paymentResource: PaymentResource
}

export default function PaymentCardsTemplate({
  customerPayments,
  children,
  paymentResource,
}: Props) {
  const { setPaymentSource } = useContext(PaymentMethodContext)
  const payments = customerPayments.map((customerPayment) => {
    const attributes = customerPayment
    const card = getCardDetails({
      customerPayment,
      paymentType: paymentResource,
    })
    const handleClick = async (e: MouseEvent) => {
      e.stopPropagation()
      await setPaymentSource({
        paymentResource,
        customerPaymentSourceId: customerPayment.id,
      })
    }
    return { ...attributes, card, handleClick }
  })
  const value = {
    customerPayments: payments,
    PaymentSourceProvider: PaymentSourceContext.Provider,
  }
  return <Parent {...value}>{children}</Parent>
}
