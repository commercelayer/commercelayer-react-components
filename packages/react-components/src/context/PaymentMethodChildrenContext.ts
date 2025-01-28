import { createContext } from 'react'
import type { PaymentMethod } from '@commercelayer/sdk'

export interface InitialPaymentMethodChildrenContext {
  payment?: PaymentMethod
  clickableContainer?: boolean
  paymentSelected?: string
  setPaymentSelected?: (paymentId: string) => void
  expressPayments?: boolean
}

const initial: InitialPaymentMethodChildrenContext = {}

const PaymentMethodChildrenContext =
  createContext<InitialPaymentMethodChildrenContext>(initial)

export default PaymentMethodChildrenContext
