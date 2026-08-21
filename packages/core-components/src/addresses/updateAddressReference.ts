import { getSdk } from "#sdk"
import type { RequestConfig } from "#types"

interface Params extends RequestConfig {
  /**
   * The address ID to update.
   */
  id: string
  /**
   * The customer address reference (customer_address ID) to link.
   */
  reference: string
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
