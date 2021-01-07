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
  saveOnBlur: boolean
  setCustomerErrors: SetCustomerErrors
  setCustomerEmail: SetCustomerEmail
}

export const defaultCustomerContext = {
  saveCustomerUser: async (): Promise<void> => {
    return
  },
  saveOnBlur: false,
  setCustomerErrors,
  setCustomerEmail,
}

const CustomerContext = createContext<DefaultContext>(defaultCustomerContext)

export default CustomerContext
