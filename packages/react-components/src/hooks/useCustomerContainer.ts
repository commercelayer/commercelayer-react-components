import CustomerContext from '#context/CustomerContext'
import {
  type setResourceTrigger,
  type CustomerState
} from '#reducers/CustomerReducer'
import { useContext } from 'react'

type TCustomer = Omit<CustomerState, 'errors' | 'isGuest'> & {
  setResourceTrigger?: typeof setResourceTrigger
}

interface TReturnCustomer extends Omit<TCustomer, 'errors' | 'isGuest'> {}

/**
 * React Hook that provides access to the order context stored in the `<CustomerContainer>` component.
 **/
export function useCustomerContainer(): TReturnCustomer {
  const ctx = useContext(CustomerContext)
  if ('addresses' in ctx) {
    return {
      addresses: ctx.addresses,
      payments: ctx.payments,
      orders: ctx.orders,
      subscriptions: ctx.subscriptions,
      customerEmail: ctx.customerEmail,
      customers: ctx.customers,
      setResourceTrigger: ctx.setResourceTrigger
    }
  }
  throw new Error(
    'Cannot use `useCustomerContainer` outside of <CustomerContainer/>'
  )
}

export default useCustomerContainer
