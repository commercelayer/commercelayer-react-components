import type { Value } from "rapid-form"
import { createContext } from "react"
import type { AddressField } from "#reducers/AddressReducer"
import type { AddressCountrySelectName, AddressInputName } from "#typings"

export interface DefaultContextAddress {
  setValue?: (
    name: AddressField | AddressInputName | AddressCountrySelectName,
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
  values?: Record<string, Value>
}

const CustomerAddressFormContext = createContext<DefaultContextAddress>({})

export default CustomerAddressFormContext
