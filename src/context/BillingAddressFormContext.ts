import { createContext, RefObject } from 'react'
import { AddressCountrySelectName, AddressInputName } from '#typings'
import { AddressField } from '#reducers/AddressReducer'

export type DefaultContextAddress = {
  validation?: () => RefObject<any>
  setValue?: (
    name: AddressField | AddressInputName | AddressCountrySelectName,
    value: any
  ) => void
  errors?: Record<string, { code: string; message: string; error: boolean }>[]
  errorClassName?: string
  requiresBillingInfo?: boolean
}

const BillingAddressFormContext = createContext<DefaultContextAddress>({})

export default BillingAddressFormContext
