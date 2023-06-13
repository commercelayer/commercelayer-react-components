import { type Order } from '@commercelayer/sdk'

/**
 * Check if the order has subscriptions reading the frequency attribute of the line items
 * @param order Order
 * @returns boolean
 */
export function hasSubscriptions(order: Order): boolean {
  return order?.line_items?.some((li) => li.frequency != null) != null
}
