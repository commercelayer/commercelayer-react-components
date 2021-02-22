import { createContext } from 'react'
import { PaymentMethodCollection } from '@commercelayer/js-sdk'

export interface InitialPaymentMethodChildrenContext {
  payment?: PaymentMethodCollection
}

const initial: InitialPaymentMethodChildrenContext = {}

const PaymentMethodChildrenContext = createContext<InitialPaymentMethodChildrenContext>(
  initial
)

export default PaymentMethodChildrenContext
