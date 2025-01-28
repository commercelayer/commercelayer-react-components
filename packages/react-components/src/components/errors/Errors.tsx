import { useContext, useMemo, type JSX } from 'react';
import Parent from '#components/utils/Parent'
import GiftCardContext from '#context/GiftCardContext'
import OrderContext from '#context/OrderContext'
import AddressContext from '#context/AddressContext'
import getAllErrors from '#components-utils/getAllErrors'
import LineItemContext from '#context/LineItemContext'
import LineItemChildrenContext from '#context/LineItemChildrenContext'
import type { CodeErrorType } from '#typings/errors'
import CustomerContext from '#context/CustomerContext'
import PaymentMethodContext from '#context/PaymentMethodContext'
import PaymentMethodChildrenContext from '#context/PaymentMethodChildrenContext'
import ShipmentContext from '#context/ShipmentContext'
import type { ChildrenFunction } from '#typings/index'
import InStockSubscriptionContext from '#context/InStockSubscriptionContext'

export type TResourceError =
  | 'addresses'
  | 'billing_address'
  | 'gift_cards'
  | 'gift_card_or_coupon_code'
  | 'line_items'
  | 'orders'
  | 'payment_methods'
  | 'prices'
  | 'shipments'
  | 'shipping_address'
  | 'customer_address'
  | 'sku_options'
  | 'variant'
  | 'in_stock_subscriptions'
type ErrorChildrenComponentProps = ChildrenFunction<
  Omit<TErrorComponent, 'children'> & { errors: string[] }
>

export interface TErrorComponent
  extends Omit<JSX.IntrinsicElements['span'], 'children'> {
  /**
   * Resource which get the error
   */
  resource: TResourceError
  children?: ErrorChildrenComponentProps
  /**
   * Field which get the error
   */
  field?: string
  /**
   * Error message which you can translate
   */
  messages?: Array<{
    code: CodeErrorType
    message: string
    resource?: TResourceError
    field?: string
    id?: string
  }>
}

type Props = TErrorComponent

export function Errors(props: Props): JSX.Element {
  const { children, messages = [], resource, field, ...p } = props
  const { payment } = useContext(PaymentMethodChildrenContext)
  const { errors: orderErrors } = useContext(OrderContext)
  const { errors: giftCardErrors } = useContext(GiftCardContext)
  const { errors: lineItemErrors } = useContext(LineItemContext)
  const { errors: addressErrors } = useContext(AddressContext)
  const { errors: customerErrors } = useContext(CustomerContext)
  const { errors: shipmentErrors } = useContext(ShipmentContext)
  const { errors: inStockSubscriptionErrors } = useContext(
    InStockSubscriptionContext
  )
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
      ...(customerErrors || []),
      ...(shipmentErrors || []),
      ...(inStockSubscriptionErrors || []),
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
      customerErrors,
      shipmentErrors,
      inStockSubscriptionErrors,
      paymentMethodErrors
    ]
  ).filter((v, k, a) => v?.code !== a[k - 1]?.code)
  const addressesErrors = useMemo(
    () => [...(addressErrors || [])],
    [addressErrors]
  )
  const msgErrors = getAllErrors({
    allErrors: [...allErrors, ...addressesErrors],
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
