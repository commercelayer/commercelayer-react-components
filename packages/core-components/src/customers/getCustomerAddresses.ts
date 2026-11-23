import type { CustomerAddress, QueryPageSize } from "@commercelayer/sdk"
import { getSdk } from "#sdk"
import type { RequestConfig } from "#types"
import type { Address } from "./types"

interface GetCustomerAddressesParams extends Pick<RequestConfig, "accessToken" | "interceptors"> {
  isOrderAvailable?: boolean
  pageSize?: QueryPageSize
}

/**
 * Retrieve customer addresses and normalize address references.
 */
export async function getCustomerAddresses({
  accessToken,
  interceptors,
  isOrderAvailable,
  pageSize = 25,
}: GetCustomerAddressesParams): Promise<Address[]> {
  const sdk = getSdk({ accessToken, interceptors })
  let customerAddresses: CustomerAddress[] = []
  let currentPage = 1
  let totalPages = 1
  do {
    const response = await sdk.customer_addresses.list({
      include: ["address"],
      pageSize,
      pageNumber: currentPage,
    })
    customerAddresses = customerAddresses.concat(response)
    totalPages = response.meta.pageCount
    currentPage++
  } while (currentPage <= totalPages)

  const addresses = customerAddresses.reduce<Address[]>((result, customerAddress) => {
    if (customerAddress.address == null) {
      return result
    }

    const address = { ...customerAddress.address }

    if (address.reference == null) {
      address.reference = customerAddress.id
    }

    if (customerAddress.id !== address.reference && !isOrderAvailable) {
      address.reference = customerAddress.id
    }

    result.push(address)
    return result
  }, [])

  return addresses.sort((firstAddress, secondAddress) =>
    (firstAddress.full_name ?? "").localeCompare(secondAddress.full_name ?? "")
  )
}
