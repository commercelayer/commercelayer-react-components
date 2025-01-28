import { createContext } from 'react'
import type { AddressCountrySelectName, AddressInputName } from '#typings'
import type { AddressField } from '#reducers/AddressReducer'

export interface DefaultContextAddress {
  // biome-ignore lint/suspicious/noConfusingVoidType: <explanation>
    validation?: void
  setValue?: (
    name: AddressField | AddressInputName | AddressCountrySelectName,
    value: any
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
  values?: Record<string, any>
}

const CustomerAddressFormContext = createContext<DefaultContextAddress>({})

export default CustomerAddressFormContext
