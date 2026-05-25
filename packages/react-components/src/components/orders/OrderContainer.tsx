import type { Order, OrderCreate } from "@commercelayer/sdk"
import type { JSX } from "react"
import { Order as OrderComponent } from "#components/orders/Order"
import type { BaseMetadataObject } from "#typings"
import type { DefaultChildrenType } from "#typings/globals"

interface Props {
  children: DefaultChildrenType
  /**
   * Metadata to add when creates a new order
   */
  metadata?: BaseMetadataObject
  /**
   * Attribute to add when creates/updates an order
   */
  attributes?: OrderCreate
  /**
   * ID of the order
   */
  orderId?: string
  /**
   * Callback called when the order is updated
   */
  fetchOrder?: (order: Order) => void
}

/**
 * @deprecated Use `<Order>` instead. `<OrderContainer>` will be removed in the next major version.
 *
 * This component is responsible for fetching the order and store it in its context.
 * It also provides the `fetchOrder` callback that is triggered every time the order is updated (it returns the updated order object as argument).
 * When the order is not placed yet, its possible to pass the `metadata` and `attributes` props to update the order.
 *
 * <span title="Requirement" type="warning">
 * Must be a child of the `<CommerceLayer>` component. <br />
 * Can be a child of the `<OrderStorage>` component and receive the `orderId` from it.
 * </span>
 *
 * <span title="Children" type="info">
 * `<AddToCartButton>`,
 * `<AdjustmentAmount>`,
 * `<CartLink>`,
 * `<CheckoutLink>`,
 * `<DiscountAmount>`,
 * `<GiftCardAmount>`,
 * `<HostedCart>`,
 * `<OrderNumber>`,
 * `<PaymentMethodAmount>`,
 * `<PlaceOrderButton>`,
 * `<PlaceOrderContainer>`,
 * `<PrivacyAndTermsCheckbox>`,
 * `<Shipping Amount>`,
 * `<SubTotalAmount>`,
 * `<TaxesAmount>`,
 * `<TotalAmount>`,
 * </span>
 *
 * <span title="Core API" type="info">
 * Check the `orders` resource from our [Core API documentation](https://docs.commercelayer.io/core/v/api-reference/orders/object).
 * </span>
 */
export function OrderContainer(props: Props): JSX.Element {
  if (process.env.NODE_ENV !== "production") {
    console.warn(
      "[commercelayer-react-components] <OrderContainer> is deprecated and will be removed in the next major version. Use <Order> instead."
    )
  }
  return <OrderComponent {...props} />
}

export default OrderContainer
