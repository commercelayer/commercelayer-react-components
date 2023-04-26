import CommerceLayerContext from '#context/CommerceLayerContext'
import InStockSubscriptionContext, {
  type InitialInStockSubscriptionContext
} from '#context/InStockSubscriptionContext'
import inStockSubscriptionReducer, {
  inStockSubscriptionInitialState,
  setInStockSubscription
} from '#reducers/InStockSubscriptionReducer'
import { type DefaultChildrenType } from '#typings/globals'
import { useContext, useReducer } from 'react'

interface Props {
  /**
   * The children of the component.
   */
  children: DefaultChildrenType
}

export function InStockSubscriptionsContainer({
  children
}: Props): JSX.Element | null {
  const config = useContext(CommerceLayerContext)
  const [state, dispatch] = useReducer(
    inStockSubscriptionReducer,
    inStockSubscriptionInitialState
  )
  const value: InitialInStockSubscriptionContext = {
    ...state,
    setInStockSubscription: async ({ customerEmail, skuCode }) =>
      await setInStockSubscription({
        customerEmail,
        skuCode,
        config,
        dispatch
      })
  }
  return (
    <InStockSubscriptionContext.Provider value={value}>
      {children}
    </InStockSubscriptionContext.Provider>
  )
}

export default InStockSubscriptionsContainer
