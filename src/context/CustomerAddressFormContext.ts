import { createContext } from 'react'
import { AddressCountrySelectName, AddressInputName } from '#typings'
import { AddressField } from '#reducers/AddressReducer'

export type DefaultContextAddress = {
  validation?: void
  setValue?: (
    name: AddressField | AddressInputName | AddressCountrySelectName,
    value: any
  ) => void
  errors?: {
    [name: string]: {
      code: string
      message: string
      error: boolean
    }
  }
  errorClassName?: string
  requiresBillingInfo?: boolean
  resetField?: (name: string) => void
  values?: Record<string, any>
}

const CustomerAddressFormContext = createContext<DefaultContextAddress>({})

export default CustomerAddressFormContext
