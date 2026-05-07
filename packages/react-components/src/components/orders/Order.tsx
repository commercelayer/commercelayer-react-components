import type { Order as OrderSDK, OrderCreate } from "@commercelayer/sdk"
import { type JSX, useContext } from "react"
import CommerceLayerContext from "#context/CommerceLayerContext"
import OrderContext from "#context/OrderContext"
import OrderStorageContext from "#context/OrderStorageContext"
import { useOrderState } from "#hooks/useOrderState"
import type { BaseMetadataObject } from "#typings"
import type { DefaultChildrenType } from "#typings/globals"
import useCustomContext from "#utils/hooks/useCustomContext"

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
  fetchOrder?: (order: OrderSDK) => void
}

/**
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
export function Order(props: Props): JSX.Element {
  const { children, orderId, metadata, attributes, fetchOrder } = props
  const { accessToken, interceptors } = useCustomContext({
    context: CommerceLayerContext,
    contextComponentName: "CommerceLayer",
    currentComponentName: "Order",
    key: "accessToken",
  })
  const storageCtx = useContext(OrderStorageContext)
  const orderValue = useOrderState({
    accessToken,
    interceptors,
    orderId,
    metadata,
    attributes,
    fetchOrder,
    ...storageCtx,
  })
  return (
    <OrderContext.Provider value={orderValue}>{children}</OrderContext.Provider>
  )
}

export default Order
