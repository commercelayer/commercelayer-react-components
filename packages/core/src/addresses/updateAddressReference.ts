import type { InterceptorManager } from "@commercelayer/sdk"
import { getSdk } from "../sdk"

interface Params {
  /**
   * The address ID to update.
   */
  id: string
  /**
   * The customer address reference (customer_address ID) to link.
   */
  reference: string
  accessToken: string
  interceptors?: InterceptorManager
}

/**
 * Updates the `reference` field on an existing address resource, linking it to a customer address.
 * Used when a customer selects a saved address to use as billing or shipping.
 */
export async function updateAddressReference({
  id,
  reference,
  accessToken,
  interceptors,
}: Params): Promise<void> {
  const sdk = getSdk({ accessToken, interceptors })
  await sdk.addresses.update({ id, reference })
}
