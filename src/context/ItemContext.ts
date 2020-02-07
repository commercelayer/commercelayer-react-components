import { createContext } from 'react'
import { ItemState } from '../reducers/ItemReducer'

const initial: ItemState = {
  item: {},
  items: {},
  quantity: {}
}

const ItemContext = createContext(initial)

export default ItemContext
