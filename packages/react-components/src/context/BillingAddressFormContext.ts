import { createContext } from 'react'
import type { Address } from '@commercelayer/sdk'

export type AddressValuesKeys =
  | `${keyof Address}`
  | `billing_address_${keyof Address}`
  | `shipping_address_${keyof Address}`
  | `billing_address_${`metadata_${string}`}`
  | `shipping_address_${`metadata_${string}`}`

export interface DefaultContextAddress {
  // eslint-disable-next-line @typescript-eslint/no-invalid-void-type
  validation?: void
  setValue?: (
    name: AddressValuesKeys,
    value: string | number | readonly string[]
  ) => void
  errors?: Record<
    string,
    {
      code: string
      message: string
      error: boolean
    }
  >
  errorClassName?: string
  requiresBillingInfo?: boolean
  resetField?: (name: string) => void
  values?: {
    [T in AddressValuesKeys]: string | { value: string }
  }
  isBusiness?: boolean
}

const BillingAddressFormContext = createContext<DefaultContextAddress>({})

export default BillingAddressFormContext
