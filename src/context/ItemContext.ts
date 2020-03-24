import { createContext } from 'react'
import {
  ItemState,
  Items,
  ItemQuantity,
  ItemOptions,
  ItemPrices
} from '../reducers/ItemReducer'

export interface InitItemContext extends ItemState {
  item: Items
  items: Items
  quantity: ItemQuantity
  option: ItemOptions
  prices: ItemPrices
}

export const initialItemContext: InitItemContext = {
  item: {},
  items: {},
  quantity: {},
  option: {},
  prices: {}
}

const ItemContext = createContext<InitItemContext>(initialItemContext)

export default ItemContext
