import { getSdk } from "#sdk"
import type { RequestConfig } from "#types"

interface SetShippingMethodParams extends Pick<RequestConfig, "accessToken" | "interceptors"> {
  shipmentId: string
  shippingMethodId: string
}

/**
 * Update the shipping method on a shipment.
 *
 * @param {string} accessToken - The access token to use for authentication.
 * @param {string} shipmentId - The ID of the shipment to update.
 * @param {string} shippingMethodId - The ID of the shipping method to assign.
 */
export async function setShippingMethod({
  accessToken,
  interceptors,
  shipmentId,
  shippingMethodId,
}: SetShippingMethodParams): Promise<void> {
  const sdk = getSdk({ accessToken, interceptors })
  await sdk.shipments.update({
    id: shipmentId,
    shipping_method: sdk.shipping_methods.relationship(shippingMethodId),
  })
}
