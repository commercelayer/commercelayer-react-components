import type {
  Address,
  AddressCreate,
  AddressUpdate,
  CustomerAddressCreate,
} from "@commercelayer/sdk"
import { getSdk } from "#sdk"
import type { RequestConfig } from "#types"
import type { TCustomerAddress } from "./types"

interface CreateCustomerAddressParams extends Pick<RequestConfig, "accessToken" | "interceptors"> {
  address: TCustomerAddress
  customerId?: string
  addresses?: Address[]
}

function sanitizeMetadata(address: TCustomerAddress): TCustomerAddress {
  const result: TCustomerAddress = { ...address }

  for (const key of Object.keys(result)) {
    if (key.startsWith("metadata_")) {
      const metaKey = key.replace("metadata_", "")
      result.metadata = {
        ...((result.metadata as Record<string, unknown>) ?? {}),
        [metaKey]: result[key],
      }
      delete result[key]
    }
  }

  return result
}

/**
 * Create or update a customer address and return the saved address.
 */
export async function createCustomerAddress({
  accessToken,
  interceptors,
  address,
  customerId,
}: CreateCustomerAddressParams): Promise<Address> {
  const sdk = getSdk({ accessToken, interceptors })

  if (address.id != null) {
    return await sdk.addresses.update(sanitizeMetadata(address) as AddressUpdate)
  }

  if (customerId == null) {
    throw new Error("customerId is required to create a customer address")
  }

  const newAddress = await sdk.addresses.create(sanitizeMetadata(address) as AddressCreate)

  const customerAddressPayload = {
    customer: sdk.customers.relationship(customerId),
    address: sdk.addresses.relationship(newAddress.id),
  } as CustomerAddressCreate

  const customerAddress = await sdk.customer_addresses.create(customerAddressPayload)

  return await sdk.addresses.update({
    id: newAddress.id,
    reference: customerAddress.id,
  })
}
