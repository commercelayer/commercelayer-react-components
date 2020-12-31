import { createContext } from 'react'
import {
  ItemState,
  Items,
  ItemQuantity,
  ItemOptions,
  ItemPrices,
  CustomLineItems,
} from '@reducers/ItemReducer'

export interface InitItemContext extends Partial<ItemState> {
  item: Items
  items: Items
  quantity: ItemQuantity
  option: ItemOptions
  prices: ItemPrices
  lineItems: CustomLineItems
}

export const initialItemContext: InitItemContext = {
  item: {},
  items: {},
  quantity: {},
  option: {},
  prices: {},
  lineItems: {},
}

const ItemContext = createContext<InitItemContext>(initialItemContext)

export default ItemContext
