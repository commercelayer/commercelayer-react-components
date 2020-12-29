import { createContext, RefObject } from 'react'
import { AddressCountrySelectName, AddressInputName } from 'typings'
import { AddressField } from '../reducers/AddressReducer'

type DefaultContext = {
  validation?: () => RefObject<any>
  setValue?: (
    name: AddressField | AddressInputName | AddressCountrySelectName,
    value: any
  ) => void
}

const BillingAddressContext = createContext<DefaultContext>({})

export default BillingAddressContext
