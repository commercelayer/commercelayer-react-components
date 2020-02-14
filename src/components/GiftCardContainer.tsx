import React, {
  ReactNode,
  FunctionComponent,
  useReducer,
  useContext
} from 'react'
import PropTypes from 'prop-types'
import GiftCardContext from '../context/GiftCardContext'
import CommerceLayerContext from '../context/CommerceLayerContext'
import giftCardReducer, {
  GiftCardState,
  giftCardInitialState,
  addGiftCardRecipient
} from '../reducers/GiftCardReducer'

export interface GiftCardContainer {
  children: ReactNode
}

const GiftCardContainer: FunctionComponent<GiftCardContainer> = props => {
  const { children } = props
  const [state, dispatch] = useReducer(giftCardReducer, giftCardInitialState)
  const config = useContext(CommerceLayerContext)
  const giftCardValue: GiftCardState = {
    addGiftCardRecipient: values =>
      addGiftCardRecipient(values, config, dispatch),
    ...state
  }
  return (
    <GiftCardContext.Provider value={giftCardValue}>
      {children}
    </GiftCardContext.Provider>
  )
}

GiftCardContainer.propTypes = {
  children: PropTypes.node
}

export default GiftCardContainer
