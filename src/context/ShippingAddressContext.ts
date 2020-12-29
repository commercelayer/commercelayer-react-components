import { createContext, RefObject } from 'react'
import { AddressField } from 'reducers/AddressReducer'
import { AddressCountrySelectName, AddressInputName } from 'typings'

type DefaultContext = {
  validation?: () => RefObject<any>
  setValue?: (
    name: AddressField | AddressInputName | AddressCountrySelectName,
    value: any
  ) => void
}

const ShippingAddressContext = createContext<DefaultContext>({})

export default ShippingAddressContext
