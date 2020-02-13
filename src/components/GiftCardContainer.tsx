import React, { ReactNode, FunctionComponent, useReducer } from 'react'
import PropTypes from 'prop-types'
import GiftCardContext from '../context/GiftCardContext'
import giftCardReducer, {
  GiftCardState,
  giftCardInitialState
} from '../reducers/GiftCardReducer'

export interface GiftCardContainer {
  children: ReactNode
}

const GiftCardContainer: FunctionComponent<GiftCardContainer> = props => {
  const { children } = props
  const [state, dispatch] = useReducer(giftCardReducer, giftCardInitialState)
  const giftCardValue: GiftCardState = {
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
