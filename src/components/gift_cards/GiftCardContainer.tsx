import { useReducer, useContext } from 'react'
import GiftCardContext from '#context/GiftCardContext'
import CommerceLayerContext from '#context/CommerceLayerContext'
import giftCardReducer, {
  giftCardInitialState,
  addGiftCardRecipient,
  addGiftCard,
  addGiftCardError,
  addGiftCardLoading,
} from '#reducers/GiftCardReducer'
import OrderContext from '#context/OrderContext'

export type Props = {
  children: JSX.Element[] | JSX.Element
}

export function GiftCardContainer(props: Props): JSX.Element {
  const { children } = props
  const [state, dispatch] = useReducer(giftCardReducer, giftCardInitialState)
  const config = useContext(CommerceLayerContext)
  const { getOrder, createOrder, order } = useContext(OrderContext)
  const giftCardValue = {
    ...state,
    addGiftCardRecipient: (values: any): void =>
      addGiftCardRecipient(values, config, dispatch),
    addGiftCard: (values: any): void =>
      addGiftCard(
        { ...values },
        { config, dispatch, getOrder, createOrder, order }
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

export default GiftCardContainer
