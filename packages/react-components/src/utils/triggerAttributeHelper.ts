import { getSdk } from "@commercelayer/core-components"
import type { Order, OrderSubscription } from "@commercelayer/sdk"
import type { CommerceLayerConfig } from "#context/CommerceLayerContext"

export type HelperRequestResource = "orders" | "order_subscriptions"

export type TriggerAttributeHelper = {
  /**
   * CommerceLayer config
   */
  config: CommerceLayerConfig
  /**
   * The resource id
   */
  id: string
} & (
  | {
      /**
       * The resource name
       */
      resource: "orders"
      /**
       * The attribute to trigger
       */
      attribute: "_place" | "_refresh" | "_create_subscriptions"
    }
  | {
      resource: "order_subscriptions"
      attribute: "_active" | "_deactivate" | "_cancel"
    }
)

type TriggerAttributeHelperResponse = Promise<Order | OrderSubscription>

/**
 * Helper to trigger an attribute on a resource
 */
export async function triggerAttributeHelper({
  config,
  id,
  attribute,
  resource,
}: TriggerAttributeHelper): TriggerAttributeHelperResponse {
  // biome-ignore lint/style/noNonNullAssertion: accessToken is guaranteed by caller context
  const sdk = getSdk({ accessToken: config.accessToken!, interceptors: config.interceptors })
  return await sdk[resource].update({
    id,
    [attribute]: true,
  })
}
