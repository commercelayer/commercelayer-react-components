import React, { FunctionComponent, useReducer, useContext } from 'react'
import PropTypes, { InferProps } from 'prop-types'
import GiftCardContext, { GCContext } from '../context/GiftCardContext'
import CommerceLayerContext from '../context/CommerceLayerContext'
import giftCardReducer, {
  giftCardInitialState,
  addGiftCardRecipient,
  addGiftCard,
  addGiftCardError,
  addGiftCardLoading
} from '../reducers/GiftCardReducer'
import OrderContext from '../context/OrderContext'

const GCCProps = {
  children: PropTypes.node.isRequired
}

export type GiftCardContainer = InferProps<typeof GCCProps>

const GiftCardContainer: FunctionComponent<GiftCardContainer> = props => {
  const { children } = props
  const [state, dispatch] = useReducer(giftCardReducer, giftCardInitialState)
  const config = useContext(CommerceLayerContext)
  const { orderId } = useContext(OrderContext)
  const giftCardValue = {
    ...state,
    addGiftCardRecipient: (values): void =>
      addGiftCardRecipient(values, config, dispatch),
    addGiftCard: (values): void =>
      addGiftCard({ ...values, orderId }, config, dispatch),
    addGiftCardError: (errors): void => addGiftCardError(errors, dispatch),
    addGiftCardLoading: (loading): void => addGiftCardLoading(loading, dispatch)
  }
  return (
    <GiftCardContext.Provider value={giftCardValue}>
      {children}
    </GiftCardContext.Provider>
  )
}

GiftCardContainer.propTypes = GCCProps

GiftCardContainer.displayName = `CLGiftCardContainer`

export default GiftCardContainer
