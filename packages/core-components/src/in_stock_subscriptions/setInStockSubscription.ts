import type { InStockSubscriptionCreate } from "@commercelayer/sdk"
import { getSdk } from "#sdk"
import type { RequestConfig } from "#types"

interface SetInStockSubscriptionParams extends Pick<RequestConfig, "accessToken" | "interceptors"> {
  /**
   * The email of the customer to subscribe. If omitted, the JWT owner email is used.
   */
  customerEmail?: string
  /**
   * The SKU code to watch for availability.
   */
  skuCode: string
}

/**
 * Create an in-stock subscription for a given SKU.
 *
 * @param {string} accessToken - The access token to use for authentication.
 * @param {string} skuCode - The SKU code to subscribe to.
 * @param {string} [customerEmail] - The customer email. If omitted, the JWT owner email is used.
 */
export async function setInStockSubscription({
  accessToken,
  interceptors,
  customerEmail,
  skuCode,
}: SetInStockSubscriptionParams): Promise<void> {
  const sdk = getSdk({ accessToken, interceptors })
  // @ts-expect-error OpenAPI schema is not updated yet for in_stock_subscriptions
  const attributes: InStockSubscriptionCreate = {
    sku_code: skuCode,
  }
  if (customerEmail != null) {
    attributes.customer_email = customerEmail
  }
  await sdk.in_stock_subscriptions.create(attributes)
}
