import { type CommerceLayerClient, type Order } from '@commercelayer/sdk'

/**
 * Check if a given `order` has a linked `order_subscription` to replace its `customer_payment_source` with the `order`'s `payment_source`.
 * @param order Order
 * @returns void
 */
export function updateOrderSubscriptionCustomerPaymentSource(
  order: Order,
  sdk: CommerceLayerClient
): void {
  if (order.subscription_created_at != null) {
    void sdk.orders
      .retrieve(order.id, {
        include: [
          'order_subscription',
          'order_subscription.customer_payment_source'
        ]
      })
      .then((order) => {
        if (
          order.payment_source_details != null &&
          order.order_subscription != null
        ) {
          // const filteredCustomerPaymentSources =
          //   sdk.customer_payment_sources.list({
          //     filters: {
          //       payment_source_token_eq:
          //         order.payment_source_details['payment_method_id']
          //     }
          //   })

          const customerPaymentSources = sdk.customer_payment_sources.list({
            pageSize: 25
          })

          // void filteredCustomerPaymentSources.then((customerPaymentSources) => {
          void customerPaymentSources.then((customerPaymentSources) => {
            if (
              customerPaymentSources.length > 0 &&
              order.payment_source_details != null &&
              order.order_subscription != null
            ) {
              const details = order.payment_source_details
              const customerPaymentSource = customerPaymentSources.find(
                (cps) =>
                  cps.payment_source_token === details['payment_method_id']
              )
              if (customerPaymentSource != null) {
                void sdk.order_subscriptions.update({
                  id: order.order_subscription?.id,
                  customer_payment_source:
                    sdk.customer_payment_sources.relationship(
                      customerPaymentSource?.id
                    )
                })
              }
            }
          })
        }
      })
  }
}
