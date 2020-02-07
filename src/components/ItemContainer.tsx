import React, { FunctionComponent, ReactNode, useReducer } from 'react'
import ItemContext from '../context/ItemContext'
import itemReducer, {
  itemInitialState,
  setItems,
  setItem
} from '../reducers/ItemReducer'
import { ItemState } from '../reducers/ItemReducer'

export interface ItemContainerProps {
  children: ReactNode
}

const ItemContainer: FunctionComponent<ItemContainerProps> = props => {
  const { children } = props
  const [state, dispatch] = useReducer(itemReducer, itemInitialState)
  const itemValue: ItemState = {
    item: state.item,
    items: state.items,
    quantity: state.quantity,
    setItems: items => setItems(items, dispatch),
    setItem: item => setItem(item, dispatch)
  }
  return (
    <ItemContext.Provider value={itemValue}>{children}</ItemContext.Provider>
  )
}

export default ItemContainer
