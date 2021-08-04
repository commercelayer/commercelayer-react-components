import { createContext } from 'react'
import { PaymentMethodCollection } from '@commercelayer/js-sdk'

export interface InitialPaymentMethodChildrenContext {
  payment?: PaymentMethodCollection
  clickableContainer?: boolean
  paymentSelected?: string
  setPaymentSelected?: (paymentId: string) => void
}

const initial: InitialPaymentMethodChildrenContext = {}

const PaymentMethodChildrenContext =
  createContext<InitialPaymentMethodChildrenContext>(initial)

export default PaymentMethodChildrenContext
