import React, {
  FunctionComponent,
  useReducer,
  useContext,
  ReactNode,
} from 'react'
import GiftCardContext from '../context/GiftCardContext'
import CommerceLayerContext from '../context/CommerceLayerContext'
import giftCardReducer, {
  giftCardInitialState,
  addGiftCardRecipient,
  addGiftCard,
  addGiftCardError,
  addGiftCardLoading,
} from '../reducers/GiftCardReducer'
import OrderContext from '../context/OrderContext'
import components from '../config/components'

const propTypes = components.GiftCardContainer.propTypes
const displayName = components.GiftCardContainer.displayName

export type GiftCardContainer = {
  children: ReactNode
}

const GiftCardContainer: FunctionComponent<GiftCardContainer> = (props) => {
  const { children } = props
  const [state, dispatch] = useReducer(giftCardReducer, giftCardInitialState)
  const config = useContext(CommerceLayerContext)
  const { orderId, getOrder, createOrder } = useContext(OrderContext)
  const giftCardValue = {
    ...state,
    addGiftCardRecipient: (values: any): void =>
      addGiftCardRecipient(values, config, dispatch),
    addGiftCard: (values: any): void =>
      addGiftCard(
        { ...values, orderId },
        { config, dispatch, getOrder, createOrder }
      ),
    addGiftCardError: (errors: any): void => addGiftCardError(errors, dispatch),
    addGiftCardLoading: (loading: boolean): void =>
      addGiftCardLoading(loading, dispatch),
  }
  return (
    <GiftCardContext.Provider value={giftCardValue}>
      {children}
    </GiftCardContext.Provider>
  )
}

GiftCardContainer.propTypes = propTypes
GiftCardContainer.displayName = displayName

export default GiftCardContainer
