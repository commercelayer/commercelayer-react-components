import { type CommerceLayerClient, type Order } from '@commercelayer/sdk'

/**
 * Check if the order has subscriptions reading the frequency attribute of the line items
 * @param order Order
 * @returns boolean
 */
export function hasSubscriptions(order: Order): boolean {
  return order?.line_items?.some((li) => li.frequency != null) != null
}

/**
 * Check if the given `order` has a linked `order_subscription` to replace its `customer_payment_source` with the updated `order`'s `payment_source`.
 * @param order Order
 * @returns void
 */
export function updateSubscriptionCustomerPaymentSource(
  order: Order,
  sdk: CommerceLayerClient
): void {
  if (order.subscription_created_at != null) {
    void sdk.orders
      .retrieve(order.id, {
        include: [
          'payment_source',
          'order_subscription',
          'order_subscription.customer_payment_source'
        ]
      })
      .then((order) => {
        if (order.payment_source != null && order.order_subscription != null) {
          void sdk.customer_payment_sources
            .list({
              filters: {
                payment_source_id_eq: order.payment_source.id
              }
            })
            .then((customerPaymentSources) => {
              if (
                customerPaymentSources.length > 0 &&
                order.order_subscription != null
              ) {
                const customerPaymentSource = customerPaymentSources[0]
                if (customerPaymentSource != null) {
                  void sdk.order_subscriptions.update({
                    id: order.order_subscription?.id,
                    customer_payment_source:
                      sdk.customer_payment_sources.relationship(
                        customerPaymentSource.id
                      )
                  })
                }
              }
            })
        }
      })
  }
}
