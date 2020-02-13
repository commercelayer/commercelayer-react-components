import { createContext } from 'react'
import { giftCardInitialState } from '../reducers/GiftCardReducer'

const GiftCardContext = createContext(giftCardInitialState)

export default GiftCardContext
