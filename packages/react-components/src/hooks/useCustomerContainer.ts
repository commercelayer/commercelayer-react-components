import CustomerContext from '#context/CustomerContext'
import { type CustomerState } from '#reducers/CustomerReducer'
import { useContext } from 'react'

interface TReturnCustomer extends Omit<CustomerState, 'errors' | 'isGuest'> {}

export function useCustomerContainer(): TReturnCustomer {
  const ctx = useContext(CustomerContext)
  if ('addresses' in ctx) {
    return {
      addresses: ctx.addresses,
      payments: ctx.payments,
      orders: ctx.orders,
      subscriptions: ctx.subscriptions,
      customerEmail: ctx.customerEmail,
      customers: ctx.customers
    }
  }
  throw new Error(
    'Cannot use `useCustomerContainer` outside of <CustomerContainer/>'
  )
}

export default useCustomerContainer
