import { createContext } from "react"
import type {
  InStockSubscriptionState,
  setInStockSubscription,
} from "#reducers/InStockSubscriptionReducer"

export interface InitialInStockSubscriptionContext extends InStockSubscriptionState {
  setInStockSubscription?: typeof setInStockSubscription
}

const initial: InitialInStockSubscriptionContext = {}

const InStockSubscriptionContext = createContext<InitialInStockSubscriptionContext>(initial)

export default InStockSubscriptionContext
