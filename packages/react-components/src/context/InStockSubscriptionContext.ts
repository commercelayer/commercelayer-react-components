import type {
  setInStockSubscription,
  InStockSubscriptionState
} from '#reducers/InStockSubscriptionReducer'
import { createContext } from 'react'

export interface InitialInStockSubscriptionContext
  extends InStockSubscriptionState {
  setInStockSubscription?: typeof setInStockSubscription
}

const initial: InitialInStockSubscriptionContext = {}

const InStockSubscriptionContext =
  createContext<InitialInStockSubscriptionContext>(initial)

export default InStockSubscriptionContext
