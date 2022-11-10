import { useContext, useMemo } from 'react'
import Parent from '#components/utils/Parent'
import GiftCardContext from '#context/GiftCardContext'
import OrderContext from '#context/OrderContext'
import AddressContext from '#context/AddressContext'
import getAllErrors from '#components-utils/getAllErrors'
import LineItemContext from '#context/LineItemContext'
import LineItemChildrenContext from '#context/LineItemChildrenContext'
import type { ErrorComponentProps } from '#typings/errors'
import CustomerContext from '#context/CustomerContext'
import PaymentMethodContext from '#context/PaymentMethodContext'
import PaymentMethodChildrenContext from '#context/PaymentMethodChildrenContext'
import ShipmentContext from '#context/ShipmentContext'

type Props = ErrorComponentProps & JSX.IntrinsicElements['span']

export function Errors(props: Props): JSX.Element {
  const { children, messages = [], resource, field, ...p } = props
  const { payment } = useContext(PaymentMethodChildrenContext)
  const { errors: orderErrors } = useContext(OrderContext)
  const { errors: giftCardErrors } = useContext(GiftCardContext)
  const { errors: lineItemErrors } = useContext(LineItemContext)
  const { errors: addressErrors } = useContext(AddressContext)
  const { errors: customerErrors } = useContext(CustomerContext)
  const { errors: shipmentErrors } = useContext(ShipmentContext)
  const {
    errors: paymentMethodErrors,
    currentPaymentMethodType,
    currentPaymentMethodId
  } = useContext(PaymentMethodContext)
  const { lineItem } = useContext(LineItemChildrenContext)
  const allErrors = useMemo(
    () => [
      ...(giftCardErrors || []),
      ...(orderErrors || []),
      ...(lineItemErrors || []),
      ...(addressErrors || []),
      ...(customerErrors || []),
      ...(shipmentErrors || []),
      ...(paymentMethodErrors?.filter(
        (v) =>
          v.field === currentPaymentMethodType &&
          payment?.id === currentPaymentMethodId
      ) || [])
    ],
    [
      giftCardErrors,
      orderErrors,
      lineItemErrors,
      addressErrors,
      customerErrors,
      shipmentErrors,
      paymentMethodErrors
    ]
  ).filter((v, k, a) => v?.code !== a[k - 1]?.code)
  const msgErrors = getAllErrors({
    allErrors,
    field,
    messages,
    props: p,
    lineItem,
    resource,
    returnHtml: !children
  })
  const parentProps = { messages, resource, field, errors: msgErrors, ...p }
  return children ? (
    <Parent {...parentProps}>{children}</Parent>
  ) : (
    <>{msgErrors}</>
  )
}

export default Errors
