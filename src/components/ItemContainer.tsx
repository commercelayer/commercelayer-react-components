import React, { FunctionComponent, ReactNode, useReducer } from 'react'
import ItemContext from '../context/ItemContext'
import itemReducer, {
  itemInitialState,
  setItemState
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
    setItems: items =>
      setItemState(items, { type: 'setItems', key: 'items' }, dispatch),
    setItem: item =>
      setItemState(item, { type: 'setItem', key: 'item' }, dispatch),
    setQuantity: item =>
      setItemState(item, { type: 'setQuantity', key: 'quantity' }, dispatch)
  }
  return (
    <ItemContext.Provider value={itemValue}>{children}</ItemContext.Provider>
  )
}

export default ItemContainer
