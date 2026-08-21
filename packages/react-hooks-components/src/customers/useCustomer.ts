import {
  type Address,
  type Customer,
  getCustomerAddresses,
  getCustomerInfo,
  type InterceptorManager,
  type QueryPageSize,
} from "@commercelayer/core-components"
import useSWR, { type KeyedMutator } from "swr"

interface UseCustomerOptions {
  interceptors?: InterceptorManager
  isOrderAvailable?: boolean
  pageSize?: QueryPageSize
}

interface UseCustomerData {
  addresses: Address[]
  customer: Customer
  customerEmail?: string
}

interface UseCustomerReturn {
  addresses: Address[]
  customer?: Customer
  customerEmail?: string
  error: string | null
  isLoading: boolean
  isValidating: boolean
  mutate: KeyedMutator<UseCustomerData>
}

const EMPTY_ADDRESSES: Address[] = []

/**
 * Retrieve customer profile information and addresses with SWR caching.
 */
export function useCustomer(
  accessToken: string,
  customerId?: string,
  options: UseCustomerOptions = {}
): UseCustomerReturn {
  const { interceptors, isOrderAvailable, pageSize } = options

  const { data, error, isLoading, isValidating, mutate } = useSWR<UseCustomerData>(
    accessToken && customerId
      ? ["customer", accessToken, customerId, isOrderAvailable, pageSize]
      : null,
    async (): Promise<UseCustomerData> => {
      if (customerId == null) {
        throw new Error("Customer ID is required")
      }

      const [customerInfo, addresses] = await Promise.all([
        getCustomerInfo({ accessToken, customerId, interceptors }),
        getCustomerAddresses({ accessToken, interceptors, isOrderAvailable, pageSize }),
      ])

      return {
        customer: customerInfo.customer,
        customerEmail: customerInfo.customerEmail,
        addresses,
      }
    },
    { revalidateOnFocus: false, revalidateOnReconnect: false }
  )

  return {
    addresses: data?.addresses ?? EMPTY_ADDRESSES,
    customer: data?.customer,
    customerEmail: data?.customerEmail,
    error: error?.message ?? null,
    isLoading,
    isValidating,
    mutate,
  }
}
