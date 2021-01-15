import { AddressCollection } from '@commercelayer/js-sdk'
import {
  SetCustomerEmail,
  setCustomerErrors,
  SetCustomerErrors,
  setCustomerEmail,
} from '@reducers/CustomerReducer'
import { BaseError } from '@typings/errors'
import { createContext } from 'react'

type DefaultContext = {
  customerEmail?: string
  errors?: BaseError[]
  saveCustomerUser: (customerEmail: string) => Promise<void>
  setCustomerErrors: SetCustomerErrors
  setCustomerEmail: SetCustomerEmail
  addresses?: AddressCollection[]
}

export const defaultCustomerContext = {
  saveCustomerUser: async (): Promise<void> => {
    return
  },
  setCustomerErrors,
  setCustomerEmail,
}

const CustomerContext = createContext<DefaultContext>(defaultCustomerContext)

export default CustomerContext
