import type { PaymentResource } from '#reducers/PaymentMethodReducer'
import type { CommerceLayerClient, Order } from '@commercelayer/sdk'

/**
 * Check if a given `order` has a linked `order_subscription` to replace its `customer_payment_source` with the `order`'s `payment_source`.
 * @param order Order
 * @returns void
 */
export function updateOrderSubscriptionCustomerPaymentSource(
  order: Order,
  paymentType: PaymentResource | undefined,
  sdk: CommerceLayerClient
): void {
  if (order.subscription_created_at != null) {
    sdk.orders
      .retrieve(order.id, {
        include: ['order_subscription', 'payment_source']
      })
      .then((order) => {
        if (
          order.payment_source_details != null &&
          order.order_subscription != null
        ) {
          const paymentSourceToken = getPaymentSourceToken(order, paymentType)
          if (paymentSourceToken != null) {
            const customerPaymentSources = sdk.customer_payment_sources.list({
              filters: {
                payment_source_token_eq: paymentSourceToken
              }
            })
            customerPaymentSources.then((customerPaymentSources) => {
              if (
                customerPaymentSources.length > 0 &&
                order.order_subscription != null
              ) {
                const customerPaymentSource = customerPaymentSources[0]
                if (customerPaymentSource != null) {
                  sdk.order_subscriptions.update({
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
        }
      })
  }
}

function getPaymentSourceToken(
  order: Order,
  paymentType: PaymentResource | undefined
): string | undefined {
  switch (paymentType) {
    case 'braintree_payments': {
      if (
        order.payment_source != null &&
        order.payment_source.type === 'braintree_payments' &&
        order.payment_source.options != null
      ) {
        return order.payment_source.options['payment_method_token']
      }
      return undefined
    }
    default: {
      return order?.payment_source_details?.['payment_method_id'] ?? undefined
    }
  }
}
