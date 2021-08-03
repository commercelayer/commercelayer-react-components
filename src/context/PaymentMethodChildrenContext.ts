import { createContext } from 'react'
import { PaymentMethodCollection } from '@commercelayer/js-sdk'

export interface InitialPaymentMethodChildrenContext {
  payment?: PaymentMethodCollection
  clickableContainer?: boolean
  paymentSelected?: string
}

const initial: InitialPaymentMethodChildrenContext = {}

const PaymentMethodChildrenContext =
  createContext<InitialPaymentMethodChildrenContext>(initial)

export default PaymentMethodChildrenContext
