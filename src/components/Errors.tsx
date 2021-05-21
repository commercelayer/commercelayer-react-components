import React, { FunctionComponent, useContext, Fragment } from 'react'
import Parent from './utils/Parent'
import GiftCardContext from '#context/GiftCardContext'
import OrderContext from '#context/OrderContext'
import AddressContext from '#context/AddressContext'
import getAllErrors from './utils/getAllErrors'
import LineItemContext from '#context/LineItemContext'
import LineItemChildrenContext from '#context/LineItemChildrenContext'
import { ErrorComponentProps } from '#typings/errors'
import components from '#config/components'
import CustomerContext from '#context/CustomerContext'
import PaymentMethodContext from '#context/PaymentMethodContext'
import PaymentMethodChildrenContext from '#context/PaymentMethodChildrenContext'

const propTypes = components.Errors.propTypes
const displayName = components.Errors.displayName

export type ErrorsProps = ErrorComponentProps & JSX.IntrinsicElements['span']

const Errors: FunctionComponent<ErrorsProps> = (props) => {
  const { children, messages = [], resource, field, ...p } = props
  const { payment } = useContext(PaymentMethodChildrenContext)
  const { errors: orderErrors } = useContext(OrderContext)
  const { errors: giftCardErrors } = useContext(GiftCardContext)
  const { errors: lineItemErrors } = useContext(LineItemContext)
  const { errors: addressErrors } = useContext(AddressContext)
  const { errors: customerErrors } = useContext(CustomerContext)
  const {
    errors: paymentMethodErrors,
    currentPaymentMethodType,
    currentPaymentMethodId,
  } = useContext(PaymentMethodContext)
  const { lineItem } = useContext(LineItemChildrenContext)
  // TODO add other errors
  const allErrors = [
    ...(giftCardErrors || []),
    ...(orderErrors || []),
    ...(lineItemErrors || []),
    ...(addressErrors || []),
    ...(customerErrors || []),
    ...(paymentMethodErrors?.filter(
      (v) =>
        v.field === currentPaymentMethodType &&
        payment?.id === currentPaymentMethodId
    ) || []),
  ]
  const parentProps = { messages, resource, field, ...p }
  const msgErrors = getAllErrors({
    allErrors,
    field,
    messages,
    props: p,
    lineItem,
    resource,
  })
  return children ? (
    <Parent {...parentProps}>{children}</Parent>
  ) : (
    <Fragment>{msgErrors}</Fragment>
  )
}

Errors.propTypes = propTypes
Errors.displayName = displayName

export default Errors
