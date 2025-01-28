import type { Order } from '@commercelayer/sdk'

/**
 *  Check if the order can be placed
 */
export function canPlaceOrder(order: Order): boolean {
  return ['draft', 'pending'].includes(order.status)
}
