import type { Address } from "@commercelayer/sdk"
import type { Value } from "rapid-form"
import { createContext } from "react"

export type AddressValuesKeys =
  | `${keyof Address}`
  | `billing_address_${keyof Address}`
  | `shipping_address_${keyof Address}`
  | `billing_address_${`metadata_${string}`}`
  | `shipping_address_${`metadata_${string}`}`
  | `billing_address_save_to_customer_book`
  | `shipping_address_save_to_customer_book`

export type ErrorMode = "inline" | "submit"

export interface DefaultContextAddress {
  setValue?: (name: AddressValuesKeys, value: string | number | readonly string[]) => void
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
  values?: Record<string, Value>
  isBusiness?: boolean
  errorMode?: ErrorMode
  /**
   * Triggers form validation and returns any errors found.
   * When `errorMode="submit"`, call this before saving to show errors.
   * After the first call, errors update inline as the user corrects fields.
   */
  validate?: () => Record<string, { code: string; message: string; error: boolean }>
}

const BillingAddressFormContext = createContext<DefaultContextAddress>({})

export default BillingAddressFormContext
