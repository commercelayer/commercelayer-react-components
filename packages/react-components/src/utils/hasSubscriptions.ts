import type { Order } from '@commercelayer/sdk'

/**
 * Check if a given `order` has subscriptions by checking the `frequency` attribute of the `line_items` (in case of brand new `order_subscription`) or the `subscription_created_at` attribute of the `order` itself (in case `order_subscription` is already existing)
 * @param order Order
 * @returns boolean
 */
export function hasSubscriptions(order: Order): boolean {
  return (
    order.line_items?.some((item) => {
      return item.frequency && item.frequency?.length > 0
    }) ||
    order?.subscription_created_at != null ||
    false
  )
}
