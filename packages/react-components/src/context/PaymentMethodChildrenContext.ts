import type { PaymentMethod } from "@commercelayer/sdk"
import { createContext } from "react"

export interface InitialPaymentMethodChildrenContext {
  payment?: PaymentMethod
  clickableContainer?: boolean
  paymentSelected?: string
  setPaymentSelected?: (paymentId: string) => void
  expressPayments?: boolean
}

const initial: InitialPaymentMethodChildrenContext = {}

const PaymentMethodChildrenContext = createContext<InitialPaymentMethodChildrenContext>(initial)

export default PaymentMethodChildrenContext
